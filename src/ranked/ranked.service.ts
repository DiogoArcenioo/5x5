import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RankedEventDto, RankedEventType } from './dto/ranked-event.dto';

const RANKING_TIME_ZONE = 'America/Sao_Paulo';

type RankedRunRow = {
  id: number;
  userId: number;
  playedOn: string;
  status: 'in_progress' | 'completed';
  score: number;
  swissWins: number;
  quarterfinalWon: boolean;
  semifinalWon: boolean;
  finalWon: boolean;
  createdAt: Date;
  completedAt: Date | null;
};

@Injectable()
export class RankedService {
  constructor(private readonly dataSource: DataSource) {}

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
    const [run] = await this.dataSource.query<RankedRunRow[]>(`${this.runSelect()}
      WHERE r.user_id = $1
        AND r.played_on = ((now() AT TIME ZONE $2) - interval '1 minute')::date
      ORDER BY r.created_at DESC LIMIT 1`, [userId, RANKING_TIME_ZONE]);
    const [access] = await this.dataSource.query<Array<{ unlimited: boolean; attemptsToday: number; extraAttemptsToday: number }>>(`
      SELECT u.ranked_unlimited AS unlimited,
             (SELECT count(r.id)::integer FROM ranked_runs r WHERE r.user_id = u.id
               AND r.played_on = ((now() AT TIME ZONE $2) - interval '1 minute')::date) AS "attemptsToday",
             CASE WHEN u.ranked_extra_attempts_on = ((now() AT TIME ZONE $2) - interval '1 minute')::date
               THEN u.ranked_extra_attempts ELSE 0 END AS "extraAttemptsToday"
      FROM app_users u WHERE u.id = $1
    `, [userId, RANKING_TIME_ZONE]);
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
    return { played: Boolean(run), canPlay, unlimited: Boolean(access?.unlimited), attemptsToday: access?.attemptsToday || 0, dailyLimit, ranking: ranking || null, run: run || null, ...clock };
  }

  async start(userId: number) {
    return this.dataSource.transaction(async (manager) => {
      const [settings] = await manager.query<Array<{ unlimited: boolean; extraAttempts: number; extraAttemptsOn: string | null }>>(`
        SELECT ranked_unlimited AS unlimited, ranked_extra_attempts AS "extraAttempts",
               ranked_extra_attempts_on::text AS "extraAttemptsOn"
        FROM app_users WHERE id = $1 FOR UPDATE
      `, [userId]);
      if (!settings) throw new NotFoundException('Usuário não encontrado.');
      const [daily] = await manager.query<Array<{ playedOn: string; attemptsToday: number }>>(`
        SELECT ((now() AT TIME ZONE $2) - interval '1 minute')::date::text AS "playedOn",
               (SELECT count(id)::integer FROM ranked_runs WHERE user_id = $1
                 AND played_on = ((now() AT TIME ZONE $2) - interval '1 minute')::date) AS "attemptsToday"
      `, [userId, RANKING_TIME_ZONE]);
      const extraAttempts = settings.extraAttemptsOn === daily.playedOn ? settings.extraAttempts : 0;
      const dailyLimit = 1 + extraAttempts;
      if (!settings.unlimited && daily.attemptsToday >= dailyLimit) {
        throw new ConflictException('Você já usou sua partida ranqueada de hoje. Volte amanhã.');
      }
      const rows = await manager.query<RankedRunRow[]>(`
        INSERT INTO ranked_runs (user_id, played_on)
        VALUES ($1, $2::date)
        RETURNING id, user_id AS "userId", played_on::text AS "playedOn", status, score,
                  swiss_wins AS "swissWins", quarterfinal_won AS "quarterfinalWon",
                  semifinal_won AS "semifinalWon", final_won AS "finalWon",
                  created_at AS "createdAt", completed_at AS "completedAt"
      `, [userId, daily.playedOn]);
      const attemptsToday = daily.attemptsToday + 1;
      return { ...rows[0], canPlay: settings.unlimited || attemptsToday < dailyLimit, unlimited: settings.unlimited, attemptsToday, dailyLimit };
    });
  }

  async addEvent(userId: number, runId: number, dto: RankedEventDto) {
    return this.dataSource.transaction(async (manager) => {
      const run = await this.lockRun(manager, userId, runId);
      const duplicate = await manager.query(
        'SELECT 1 FROM ranked_run_events WHERE run_id = $1 AND event_key = $2',
        [runId, dto.eventKey],
      ) as Array<Record<string, unknown>>;
      if (duplicate[0]) return { run, awarded: 0, duplicate: true };
      if (run.status !== 'in_progress') throw new ConflictException('Esta partida ranqueada já foi encerrada.');

      const points = this.validateProgression(run, dto.eventType);
      await manager.query(
        'INSERT INTO ranked_run_events (run_id, event_key, event_type, points) VALUES ($1, $2, $3, $4)',
        [runId, dto.eventKey, dto.eventType, points],
      );
      const update = this.progressionUpdate(dto.eventType);
      await manager.query(`
        UPDATE ranked_runs SET score = score + $2, ${update}, updated_at = now()
        WHERE id = $1
      `, [runId, points]);
      const updatedRows = await manager.query<RankedRunRow[]>(`${this.runSelect()} WHERE r.id = $1`, [runId]);
      const updated = updatedRows[0];
      if (!updated) throw new NotFoundException('Partida ranqueada não encontrada após atualizar a pontuação.');
      return { run: updated, awarded: points, duplicate: false };
    });
  }

  async complete(userId: number, runId: number) {
    await this.lockRun(this.dataSource.manager, userId, runId, false);
    const [run] = await this.dataSource.query<RankedRunRow[]>(`
      UPDATE ranked_runs SET status = 'completed', completed_at = COALESCE(completed_at, now()), updated_at = now()
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id AS "userId", played_on::text AS "playedOn", status, score,
                swiss_wins AS "swissWins", quarterfinal_won AS "quarterfinalWon",
                semifinal_won AS "semifinalWon", final_won AS "finalWon",
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
    return `SELECT r.id, r.user_id AS "userId", r.played_on::text AS "playedOn", r.status, r.score,
                   r.swiss_wins AS "swissWins", r.quarterfinal_won AS "quarterfinalWon",
                   r.semifinal_won AS "semifinalWon", r.final_won AS "finalWon",
                   r.created_at AS "createdAt", r.completed_at AS "completedAt"
            FROM ranked_runs r`;
  }
}
