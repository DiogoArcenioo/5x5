import { ConflictException, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';

export const RANKING_TIME_ZONE = 'America/Sao_Paulo';

export type RankedFieldEntry = {
  teamSlug: string;
  year: number;
};

export type RankedCycleRow = {
  id: number;
  playedOn: string;
  version: number;
  field: RankedFieldEntry[];
  createdAt: Date;
};

type EligibleLineupRow = {
  teamSlug: string;
  year: number;
};

@Injectable()
export class RankedCycleService {
  constructor(private readonly dataSource: DataSource) {}

  current() {
    return this.dataSource.transaction((manager) => this.getOrCreate(manager));
  }

  reset() {
    return this.dataSource.transaction((manager) => this.getOrCreate(manager, true));
  }

  async getOrCreate(manager: EntityManager, forceNew = false): Promise<RankedCycleRow> {
    const [clock] = await manager.query<Array<{ playedOn: string }>>(`
      SELECT ((now() AT TIME ZONE $1) - interval '1 minute')::date::text AS "playedOn"
    `, [RANKING_TIME_ZONE]);

    // Serializa a criacao/reset do ciclo para que duas requisicoes simultaneas
    // nunca sorteiem campos diferentes para a mesma edicao ranqueada.
    await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`ranked-cycle:${clock.playedOn}`]);

    const [active] = await manager.query<RankedCycleRow[]>(`
      SELECT id, played_on::text AS "playedOn", version, field, created_at AS "createdAt"
      FROM ranked_cycles
      WHERE played_on = $1::date
      ORDER BY version DESC
      LIMIT 1
    `, [clock.playedOn]);
    if (active && !forceNew) return active;

    const field = await this.drawField(manager);
    const version = (active?.version || 0) + 1;
    const [created] = await manager.query<RankedCycleRow[]>(`
      INSERT INTO ranked_cycles (played_on, version, field)
      VALUES ($1::date, $2, $3::jsonb)
      RETURNING id, played_on::text AS "playedOn", version, field, created_at AS "createdAt"
    `, [clock.playedOn, version, JSON.stringify(field)]);
    if (!active) {
      // Preserva o limite diario durante a implantacao da funcionalidade:
      // tentativas feitas hoje antes da primeira criacao de ciclo entram nele.
      await manager.query(`
        UPDATE ranked_runs
        SET cycle_id = $2
        WHERE played_on = $1::date AND cycle_id IS NULL
      `, [clock.playedOn, created.id]);
    }
    return created;
  }

  private async drawField(manager: EntityManager): Promise<RankedFieldEntry[]> {
    const rows = await manager.query<EligibleLineupRow[]>(`
      SELECT t.slug AS "teamSlug", pty.year::integer AS year
      FROM teams t
      JOIN player_team_years pty ON pty.team_id = t.id
      WHERE t.active = true
      GROUP BY t.id, t.slug, pty.year
      HAVING count(DISTINCT pty.player_id) >= 5
      ORDER BY t.slug, pty.year
    `);

    const yearsByTeam = new Map<string, number[]>();
    for (const row of rows) {
      const years = yearsByTeam.get(row.teamSlug) || [];
      years.push(Number(row.year));
      yearsByTeam.set(row.teamSlug, years);
    }
    if (yearsByTeam.size < 15) {
      throw new ConflictException('O catalogo precisa ter ao menos 15 times com lineups completas para criar o Major ranqueado.');
    }

    const teams = this.shuffle([...yearsByTeam.keys()]).slice(0, 15);
    return teams.map((teamSlug) => {
      const years = yearsByTeam.get(teamSlug)!;
      return { teamSlug, year: years[randomInt(years.length)] };
    });
  }

  private shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const selected = randomInt(index + 1);
      [items[index], items[selected]] = [items[selected], items[index]];
    }
    return items;
  }
}
