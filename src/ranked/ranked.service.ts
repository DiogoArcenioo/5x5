import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RankedEventType } from './dto/ranked-event.dto';
import { RankedCycleService, RANKING_TIME_ZONE } from './ranked-cycle.service';
import { RankedCampaign, RankedSimulationService } from './ranked-simulation.service';
import { attachSimulationContext, campaignDiagnosticContext } from '../shared/simulation-diagnostics';

type RankedRunRow = {
  id: number;
  userId: number;
  cycleId: number | null;
  playedOn: string;
  status: 'in_progress' | 'completed';
  score: number;
  swissWins: number;
  quarterfinalWon: boolean;
  semifinalWon: boolean;
  finalWon: boolean;
  campaign: RankedCampaign | null;
  campaignRevision: number;
  createdAt: Date;
  completedAt: Date | null;
};

@Injectable()
export class RankedService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cycles: RankedCycleService,
    private readonly simulation: RankedSimulationService,
  ) {}

  async leaderboard(limit = 100) {
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);
    const entries = await this.dataSource.query(`
      WITH totals AS (
        SELECT u.id AS "userId", u.username,
               GREATEST(0, COALESCE(sum(r.score), 0)::integer + u.ranked_points_adjustment)::integer AS points,
               GREATEST(0, count(r.id)::integer + u.ranked_matches_adjustment)::integer AS attempts,
               max(r.played_on)::text AS "lastPlayedOn",
               max(r.updated_at) AS "lastUpdatedAt"
        FROM app_users u
        LEFT JOIN ranked_runs r ON r.user_id = u.id
        WHERE u.status = 'active'
        GROUP BY u.id, u.username, u.ranked_points_adjustment, u.ranked_matches_adjustment
      )
      SELECT row_number() OVER (ORDER BY points DESC, "lastUpdatedAt" ASC NULLS LAST, "userId" ASC)::integer AS rank,
             "userId", username, points, attempts, "lastPlayedOn"
      FROM totals
      WHERE points > 0 OR attempts > 0
      ORDER BY points DESC, "lastUpdatedAt" ASC NULLS LAST, "userId" ASC
      LIMIT $1
    `, [safeLimit]) as Array<Record<string, unknown>>;
    return { entries, scoring: { swissWin: 10, quarterfinalWin: 30, semifinalWin: 30, finalWin: 50, maximum: 140 } };
  }

  async today(userId: number) {
    const cycle = await this.cycles.current();
    let [run] = await this.dataSource.query<RankedRunRow[]>(`${this.runSelect()}
      WHERE r.user_id = $1
        AND r.cycle_id = $2
      ORDER BY r.created_at DESC LIMIT 1`, [userId, cycle.id]);
    if (run?.status === 'in_progress' && !run.campaign) {
      const campaign = this.simulation.create(cycle.field);
      await this.dataSource.query('UPDATE ranked_runs SET campaign = $2::jsonb, campaign_revision = 0, updated_at = now() WHERE id = $1', [run.id, JSON.stringify(campaign)]);
      [run] = await this.dataSource.query<RankedRunRow[]>(`${this.runSelect()} WHERE r.id = $1`, [run.id]);
    }
    const [access] = await this.dataSource.query<Array<{ unlimited: boolean; attemptsToday: number; extraAttemptsToday: number }>>(`
      SELECT u.ranked_unlimited AS unlimited,
             (SELECT count(r.id)::integer FROM ranked_runs r WHERE r.user_id = u.id
               AND r.cycle_id = $3) AS "attemptsToday",
             CASE WHEN u.ranked_extra_attempts_on = ((now() AT TIME ZONE $2) - interval '1 minute')::date
               THEN u.ranked_extra_attempts ELSE 0 END AS "extraAttemptsToday"
      FROM app_users u WHERE u.id = $1
    `, [userId, RANKING_TIME_ZONE, cycle.id]);
    const [clock] = await this.dataSource.query<Array<{ today: string; nextAvailableAt: Date }>>(`
      SELECT ((now() AT TIME ZONE $1) - interval '1 minute')::date::text AS today,
             (((((now() AT TIME ZONE $1) - interval '1 minute')::date + interval '1 day 1 minute')) AT TIME ZONE $1) AS "nextAvailableAt"
    `, [RANKING_TIME_ZONE]);
    const [ranking] = await this.dataSource.query<Array<{ rank: number; total: number; points: number; attempts: number }>>(`
      WITH totals AS (
        SELECT u.id AS "userId",
               GREATEST(0, COALESCE(sum(r.score), 0)::integer + u.ranked_points_adjustment)::integer AS points,
               GREATEST(0, count(r.id)::integer + u.ranked_matches_adjustment)::integer AS attempts,
               max(r.updated_at) AS "lastUpdatedAt"
        FROM app_users u
        LEFT JOIN ranked_runs r ON r.user_id = u.id
        WHERE u.status = 'active'
        GROUP BY u.id, u.ranked_points_adjustment, u.ranked_matches_adjustment
      ), ranked AS (
        SELECT "userId", points, attempts,
               row_number() OVER (ORDER BY points DESC, "lastUpdatedAt" ASC NULLS LAST, "userId" ASC)::integer AS rank,
               count(*) OVER ()::integer AS total
        FROM totals
        WHERE points > 0 OR attempts > 0
      )
      SELECT rank, total, points, attempts FROM ranked WHERE "userId" = $1
    `, [userId]);
    const dailyLimit = 1 + (access?.extraAttemptsToday || 0);
    const canPlay = Boolean(access?.unlimited) || (access?.attemptsToday || 0) < dailyLimit;
    return {
      played: Boolean(run), canPlay, unlimited: Boolean(access?.unlimited),
      attemptsToday: access?.attemptsToday || 0, dailyLimit, ranking: ranking || null,
      run: run || null, field: cycle.field,
      cycle: { id: cycle.id, playedOn: cycle.playedOn, version: cycle.version },
      ...clock,
    };
  }

  async start(userId: number) {
    return this.dataSource.transaction(async (manager) => {
      const cycle = await this.cycles.getOrCreate(manager);
      const [settings] = await manager.query<Array<{ unlimited: boolean; extraAttempts: number; extraAttemptsOn: string | null }>>(`
        SELECT ranked_unlimited AS unlimited, ranked_extra_attempts AS "extraAttempts",
               ranked_extra_attempts_on::text AS "extraAttemptsOn"
        FROM app_users WHERE id = $1 FOR UPDATE
      `, [userId]);
      if (!settings) throw new NotFoundException('Usuário não encontrado.');
      const [daily] = await manager.query<Array<{ playedOn: string; attemptsToday: number }>>(`
        SELECT ((now() AT TIME ZONE $2) - interval '1 minute')::date::text AS "playedOn",
               (SELECT count(id)::integer FROM ranked_runs WHERE user_id = $1
                 AND cycle_id = $3) AS "attemptsToday"
      `, [userId, RANKING_TIME_ZONE, cycle.id]);
      const extraAttempts = settings.extraAttemptsOn === daily.playedOn ? settings.extraAttempts : 0;
      const dailyLimit = 1 + extraAttempts;
      if (!settings.unlimited && daily.attemptsToday >= dailyLimit) {
        throw new ConflictException('Você já usou sua partida ranqueada de hoje. Volte amanhã.');
      }
      const rows = await manager.query<RankedRunRow[]>(`
        INSERT INTO ranked_runs (user_id, cycle_id, played_on, campaign)
        VALUES ($1, $2, $3::date, $4::jsonb)
        RETURNING id, user_id AS "userId", cycle_id AS "cycleId", played_on::text AS "playedOn", status, score,
                  swiss_wins AS "swissWins", quarterfinal_won AS "quarterfinalWon",
                  semifinal_won AS "semifinalWon", final_won AS "finalWon", campaign,
                  campaign_revision AS "campaignRevision",
                  created_at AS "createdAt", completed_at AS "completedAt"
      `, [userId, cycle.id, daily.playedOn, JSON.stringify(this.simulation.create(cycle.field))]);
      const attemptsToday = daily.attemptsToday + 1;
      return {
        ...rows[0], canPlay: settings.unlimited || attemptsToday < dailyLimit,
        unlimited: settings.unlimited, attemptsToday, dailyLimit, field: cycle.field,
        cycle: { id: cycle.id, playedOn: cycle.playedOn, version: cycle.version },
      };
    });
  }

  strategy(userId: number, runId: number, revision: number, roles: string[]) { return this.mutateCampaign(userId, runId, revision, 'strategy', (manager, campaign) => this.simulation.strategy(manager, campaign, roles)); }
  reroll(userId: number, runId: number, revision: number) { return this.mutateCampaign(userId, runId, revision, 'draft.reroll', (manager, campaign) => this.simulation.reroll(manager, campaign)); }
  pick(userId: number, runId: number, revision: number, slug: string, slot: number) { return this.mutateCampaign(userId, runId, revision, 'draft.pick', (manager, campaign) => this.simulation.pick(manager, campaign, slug, slot)); }
  layout(userId: number, runId: number, revision: number, slugs: Array<string|null>, roles: string[]) { return this.mutateCampaign(userId, runId, revision, 'draft.layout', (manager, campaign) => this.simulation.layout(manager, campaign, slugs, roles)); }
  finalize(userId: number, runId: number, revision: number) { return this.mutateCampaign(userId, runId, revision, 'draft.finalize', (manager, campaign) => this.simulation.finalize(manager, campaign)); }

  advance(userId: number, runId: number, expectedRevision: number) {
    return this.dataSource.transaction(async (manager) => {
      let run: RankedRunRow | undefined;
      try {
      run = await this.lockRun(manager, userId, runId);
      if (run.status !== 'in_progress' || !run.campaign) throw new ConflictException('A campanha ranqueada não está disponível.');
      if (run.campaignRevision !== expectedRevision) throw this.revisionConflict(run);
      const result = this.simulation.advance(run.campaign);
      const revision = run.campaignRevision + 1;
      if (result.awarded && result.eventType) {
        const eventType = result.eventType as RankedEventType;
        await manager.query('INSERT INTO ranked_run_events (run_id, event_key, event_type, points) VALUES ($1, $2, $3, $4)', [runId, `server-${revision}-${eventType}`, eventType, result.awarded]);
        await manager.query(`UPDATE ranked_runs SET score = score + $2, ${this.progressionUpdate(eventType)} WHERE id = $1`, [runId, result.awarded]);
      }
      const completed = result.campaign.stage === 'completed';
      await manager.query(`UPDATE ranked_runs SET campaign = $2::jsonb, campaign_revision = $3, status = CASE WHEN $4 THEN 'completed' ELSE status END, completed_at = CASE WHEN $4 THEN COALESCE(completed_at, now()) ELSE completed_at END, updated_at = now() WHERE id = $1`, [runId, JSON.stringify(result.campaign), revision, completed]);
      const [updated] = await manager.query<RankedRunRow[]>(`${this.runSelect()} WHERE r.id = $1`, [runId]);
      return { run: updated, campaign: result.campaign, matches: result.matches, awarded: result.awarded, eventType: result.eventType };
      } catch (error) {
        throw attachSimulationContext(error, campaignDiagnosticContext(runId, 'advance', run?.campaign));
      }
    });
  }
  async complete(userId: number, runId: number) {
    const current = await this.lockRun(this.dataSource.manager, userId, runId, false);
    if (current.campaign?.stage !== 'completed') throw new ConflictException('A campanha ainda possui partidas oficiais pendentes.');
    const [run] = await this.dataSource.query<RankedRunRow[]>(`
      UPDATE ranked_runs SET status = 'completed', completed_at = COALESCE(completed_at, now()), updated_at = now()
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id AS "userId", cycle_id AS "cycleId", played_on::text AS "playedOn", status, score,
                swiss_wins AS "swissWins", quarterfinal_won AS "quarterfinalWon",
                  semifinal_won AS "semifinalWon", final_won AS "finalWon", campaign,
                  campaign_revision AS "campaignRevision",
                created_at AS "createdAt", completed_at AS "completedAt"
    `, [runId, userId]);
    return run;
  }

  private async lockRun(manager: EntityManager, userId: number, runId: number, lock = true) {
    const rows = await manager.query<RankedRunRow[]>(`${this.runSelect()}
      WHERE r.id = $1 ${lock ? 'FOR UPDATE' : ''}`, [runId]);
    const run = rows[0];
    if (!run) throw new NotFoundException('Partida ranqueada não encontrada.');
    if (run.userId !== userId) throw new ForbiddenException('Esta partida ranqueada pertence a outro usuário.');
    const [date] = await manager.query<Array<{ today: boolean }>>(
      `SELECT $1::date = ((now() AT TIME ZONE $2) - interval '1 minute')::date AS today`, [run.playedOn, RANKING_TIME_ZONE],
    );
    if (!date.today) throw new ConflictException('Esta partida ranqueada não pertence ao dia de hoje.');
    return run;
  }

  private validateProgression(run: RankedRunRow, type: RankedEventType): number {
    if (type === 'swiss_win') {
      if (run.swissWins >= 3) throw new ConflictException('As três vitórias da fase suíça já foram pontuadas.');
      return 10;
    }
    if (run.swissWins < 3) throw new ConflictException('É preciso classificar na fase suíça antes dos playoffs.');
    if (type === 'quarterfinal_win') {
      if (run.quarterfinalWon) throw new ConflictException('A vitória das quartas já foi pontuada.');
      return 30;
    }
    if (!run.quarterfinalWon) throw new ConflictException('É preciso vencer as quartas antes de avançar.');
    if (type === 'semifinal_win') {
      if (run.semifinalWon) throw new ConflictException('A vitória da semifinal já foi pontuada.');
      return 30;
    }
    if (!run.semifinalWon) throw new ConflictException('É preciso vencer a semifinal antes de avançar.');
    if (run.finalWon) throw new ConflictException('A vitória da final já foi pontuada.');
    return 50;
  }

  private progressionUpdate(type: RankedEventType) {
    if (type === 'swiss_win') return 'swiss_wins = swiss_wins + 1';
    if (type === 'quarterfinal_win') return 'quarterfinal_won = true';
    if (type === 'semifinal_win') return 'semifinal_won = true';
    return 'final_won = true';
  }

  private runSelect() {
    return `SELECT r.id, r.user_id AS "userId", r.cycle_id AS "cycleId", r.played_on::text AS "playedOn", r.status, r.score,
                   r.swiss_wins AS "swissWins", r.quarterfinal_won AS "quarterfinalWon",
                   r.semifinal_won AS "semifinalWon", r.final_won AS "finalWon", r.campaign,
                   r.campaign_revision AS "campaignRevision",
                   r.created_at AS "createdAt", r.completed_at AS "completedAt"
            FROM ranked_runs r`;
  }

  private mutateCampaign(userId: number, runId: number, expectedRevision: number, action: string, mutate: (manager: EntityManager, campaign: RankedCampaign) => RankedCampaign | Promise<RankedCampaign>) {
    return this.dataSource.transaction(async (manager) => {
      let run: RankedRunRow | undefined;
      try {
      run = await this.lockRun(manager, userId, runId);
      if (run.status !== 'in_progress' || !run.campaign) throw new ConflictException('A campanha ranqueada não está disponível.');
      if (run.campaignRevision !== expectedRevision) throw this.revisionConflict(run);
      const campaign = await mutate(manager, run.campaign);
      const revision = run.campaignRevision + 1;
      await manager.query('UPDATE ranked_runs SET campaign = $2::jsonb, campaign_revision = $3, updated_at = now() WHERE id = $1', [runId, JSON.stringify(campaign), revision]);
      const [updated] = await manager.query<RankedRunRow[]>(`${this.runSelect()} WHERE r.id = $1`, [runId]);
      return { run: updated, campaign };
      } catch (error) {
        throw attachSimulationContext(error, campaignDiagnosticContext(runId, action, run?.campaign));
      }
    });
  }

  private revisionConflict(run: RankedRunRow) {
    return new ConflictException({ code: 'CAMPAIGN_REVISION_CONFLICT', message: 'A campanha foi atualizada em outra solicitação.', mode: 'ranked', run });
  }
}
