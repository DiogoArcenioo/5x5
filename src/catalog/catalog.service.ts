import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly dataSource: DataSource) {}

  async bootstrap(): Promise<Record<string, unknown>> {
    type TeamRow = Record<string, unknown> & { id: number };
    type LineupRow = { teamId: number; year: number; players: Array<Record<string, unknown>> };

    const [summary, teams, players, lineupRows] = await Promise.all([
      this.summary(),
      this.dataSource.query(`
        SELECT t.id, t.name, t.short_name AS "shortName", t.slug,
               t.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName",
               r.name AS "regionName",
               (SELECT count(DISTINCT pty.player_id)::integer FROM player_team_years pty WHERE pty.team_id=t.id) AS "playerCount",
               (SELECT count(DISTINCT pty.year)::integer FROM player_team_years pty WHERE pty.team_id=t.id) AS "yearCount"
        FROM teams t
        LEFT JOIN countries c ON c.id=t.country_id
        LEFT JOIN regions r ON r.id=c.region_id
        WHERE t.active = true
        ORDER BY t.name
      `) as Promise<TeamRow[]>,
      this.dataSource.query(`
        SELECT p.id, p.nickname, p.display_name AS "displayName", p.slug,
               p.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName", r.name AS "regionName",
               p.birth_date AS "birthDate", p.career_status AS "careerStatus",
               latest.year AS "statsYear", latest.overall, latest.firepower,
               latest.entrying, latest.trading, latest.opening, latest.clutching,
               latest.sniping, latest.utility
        FROM players p
        LEFT JOIN countries c ON c.id=p.country_id
        LEFT JOIN regions r ON r.id=c.region_id
        LEFT JOIN LATERAL (
          SELECT pty.year, pty.overall, pty.firepower, pty.entrying, pty.trading,
                 pty.opening, pty.clutching, pty.sniping, pty.utility
          FROM player_team_years pty
          JOIN teams linked_team ON linked_team.id = pty.team_id AND linked_team.active = true
          WHERE pty.player_id = p.id
          ORDER BY pty.year DESC
          LIMIT 1
        ) latest ON true
        WHERE EXISTS (
          SELECT 1 FROM player_team_years visible_link
          JOIN teams visible_team ON visible_team.id = visible_link.team_id AND visible_team.active = true
          WHERE visible_link.player_id = p.id
        )
        ORDER BY latest.overall DESC NULLS LAST, p.nickname
      `) as Promise<Array<Record<string, unknown>>>,
      this.dataSource.query(`
        SELECT pty.team_id AS "teamId", pty.year,
               jsonb_agg(jsonb_build_object(
                 'id', p.id, 'nickname', p.nickname, 'displayName', p.display_name,
                 'slug', p.slug, 'countryCode', c.code,
                 'overall', pty.overall, 'firepower', pty.firepower,
                 'entrying', pty.entrying, 'trading', pty.trading,
                 'opening', pty.opening, 'clutching', pty.clutching,
                 'sniping', pty.sniping, 'utility', pty.utility
               ) ORDER BY pty.overall DESC, p.nickname) AS players
        FROM player_team_years pty
        JOIN teams active_team ON active_team.id=pty.team_id AND active_team.active = true
        JOIN players p ON p.id=pty.player_id
        LEFT JOIN countries c ON c.id=p.country_id
        GROUP BY pty.team_id, pty.year
        ORDER BY pty.team_id, pty.year DESC
      `) as Promise<LineupRow[]>,
    ]);

    const lineupsByTeam = new Map<number, Array<Omit<LineupRow, 'teamId'>>>();
    for (const { teamId, year, players: lineupPlayers } of lineupRows) {
      const lineups = lineupsByTeam.get(teamId) ?? [];
      lineups.push({ year, players: lineupPlayers });
      lineupsByTeam.set(teamId, lineups);
    }

    return {
      summary,
      teams: teams.map((team) => ({
        ...team,
        lineups: lineupsByTeam.get(team.id) ?? [],
      })),
      players,
    };
  }

  async summary(): Promise<Record<string, unknown>> {
    const [counts] = await this.dataSource.query(`
      SELECT
        (SELECT count(*)::integer FROM regions) AS regions,
        (SELECT count(*)::integer FROM countries) AS countries,
        (SELECT count(*)::integer FROM teams WHERE active = true) AS teams,
        (SELECT count(DISTINCT pty.player_id)::integer FROM player_team_years pty JOIN teams t ON t.id=pty.team_id WHERE t.active = true) AS players,
        (SELECT count(*)::integer FROM player_team_years pty JOIN teams t ON t.id=pty.team_id WHERE t.active = true) AS links
    `) as Array<Record<string, unknown>>;
    return counts;
  }

  async teams(query: CatalogQueryDto): Promise<Record<string, unknown>> {
    const values: unknown[] = [];
    const conditions: string[] = ['t.active = true'];
    const add = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (query.search) {
      const term = add(`%${query.search.trim()}%`);
      conditions.push(`(t.name ILIKE ${term} OR t.short_name ILIKE ${term})`);
    }
    if (query.countryCode) conditions.push(`c.code = ${add(query.countryCode.toUpperCase())}`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    const limit = add(query.pageSize);
    const offset = add((query.page - 1) * query.pageSize);
    const data = await this.dataSource.query(`
      SELECT t.id, t.name, t.short_name AS "shortName", t.slug,
             t.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName",
             r.name AS "regionName",
             (SELECT count(DISTINCT pty.player_id)::integer FROM player_team_years pty WHERE pty.team_id=t.id) AS "playerCount",
             (SELECT count(DISTINCT pty.year)::integer FROM player_team_years pty WHERE pty.team_id=t.id) AS "yearCount"
      FROM teams t
      LEFT JOIN countries c ON c.id=t.country_id
      LEFT JOIN regions r ON r.id=c.region_id
      ${where}
      ORDER BY t.name LIMIT ${limit} OFFSET ${offset}
    `, values) as Array<Record<string, unknown>>;
    const [count] = await this.dataSource.query(`
      SELECT count(*)::integer AS total FROM teams t
      LEFT JOIN countries c ON c.id=t.country_id ${where}
    `, countValues) as Array<{ total: number }>;
    return this.page(data, count.total, query);
  }

  async team(slug: string): Promise<Record<string, unknown>> {
    const [team] = await this.dataSource.query(`
      SELECT t.id, t.name, t.short_name AS "shortName", t.slug,
             t.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName", r.name AS "regionName"
      FROM teams t LEFT JOIN countries c ON c.id=t.country_id LEFT JOIN regions r ON r.id=c.region_id
      WHERE upper(t.slug)=upper($1) AND t.active = true
    `, [slug]) as Array<Record<string, unknown>>;
    if (!team) throw new NotFoundException('Time não encontrado.');
    const lineups = await this.dataSource.query(`
      SELECT pty.year,
             jsonb_agg(jsonb_build_object(
               'id', p.id, 'nickname', p.nickname, 'displayName', p.display_name,
               'slug', p.slug, 'countryCode', c.code,
               'overall', pty.overall, 'firepower', pty.firepower,
               'entrying', pty.entrying, 'trading', pty.trading,
               'opening', pty.opening, 'clutching', pty.clutching,
               'sniping', pty.sniping, 'utility', pty.utility
             ) ORDER BY pty.overall DESC, p.nickname) AS players
      FROM player_team_years pty
      JOIN players p ON p.id=pty.player_id
      LEFT JOIN countries c ON c.id=p.country_id
      WHERE pty.team_id=$1
      GROUP BY pty.year ORDER BY pty.year DESC
    `, [team.id]);
    return { ...team, lineups };
  }

  async players(query: CatalogQueryDto): Promise<Record<string, unknown>> {
    const values: unknown[] = [];
    const conditions: string[] = [`EXISTS (
      SELECT 1 FROM player_team_years visible_link
      JOIN teams visible_team ON visible_team.id = visible_link.team_id AND visible_team.active = true
      WHERE visible_link.player_id = p.id
    )`];
    const add = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (query.search) {
      const term = add(`%${query.search.trim()}%`);
      conditions.push(`(p.nickname ILIKE ${term} OR p.display_name ILIKE ${term})`);
    }
    if (query.status) conditions.push(`p.career_status = ${add(query.status)}`);
    if (query.countryCode) conditions.push(`c.code = ${add(query.countryCode.toUpperCase())}`);
    let statsYear = '';
    if (query.year) {
      const year = add(query.year);
      statsYear = `AND pty.year = ${year}`;
      conditions.push(`EXISTS (
        SELECT 1 FROM player_team_years yearly
        JOIN teams yearly_team ON yearly_team.id = yearly.team_id AND yearly_team.active = true
        WHERE yearly.player_id = p.id AND yearly.year = ${year}
      )`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    const limit = add(query.pageSize);
    const offset = add((query.page - 1) * query.pageSize);
    const data = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.display_name AS "displayName", p.slug,
             p.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName", r.name AS "regionName",
             p.birth_date AS "birthDate", p.career_status AS "careerStatus",
             latest.year AS "statsYear", latest.overall, latest.firepower,
             latest.entrying, latest.trading, latest.opening, latest.clutching,
             latest.sniping, latest.utility
      FROM players p LEFT JOIN countries c ON c.id=p.country_id LEFT JOIN regions r ON r.id=c.region_id
      LEFT JOIN LATERAL (
        SELECT pty.year, pty.overall, pty.firepower, pty.entrying, pty.trading,
               pty.opening, pty.clutching, pty.sniping, pty.utility
        FROM player_team_years pty
        JOIN teams stats_team ON stats_team.id = pty.team_id AND stats_team.active = true
        WHERE pty.player_id = p.id ${statsYear}
        ORDER BY pty.year DESC
        LIMIT 1
      ) latest ON true
      ${where} ORDER BY latest.overall DESC NULLS LAST, p.nickname LIMIT ${limit} OFFSET ${offset}
    `, values) as Array<Record<string, unknown>>;
    const [count] = await this.dataSource.query(`
      SELECT count(*)::integer AS total FROM players p LEFT JOIN countries c ON c.id=p.country_id ${where}
    `, countValues) as Array<{ total: number }>;
    return this.page(data, count.total, query);
  }

  async player(slug: string): Promise<Record<string, unknown>> {
    const [player] = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.display_name AS "displayName", p.slug,
             p.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName", r.name AS "regionName",
             p.birth_date AS "birthDate", p.career_status AS "careerStatus",
             latest.year AS "statsYear", latest.overall, latest.firepower,
             latest.entrying, latest.trading, latest.opening, latest.clutching,
             latest.sniping, latest.utility
      FROM players p LEFT JOIN countries c ON c.id=p.country_id LEFT JOIN regions r ON r.id=c.region_id
      LEFT JOIN LATERAL (
        SELECT pty.year, pty.overall, pty.firepower, pty.entrying, pty.trading,
               pty.opening, pty.clutching, pty.sniping, pty.utility
        FROM player_team_years pty
        JOIN teams stats_team ON stats_team.id = pty.team_id AND stats_team.active = true
        WHERE pty.player_id = p.id
        ORDER BY pty.year DESC
        LIMIT 1
      ) latest ON true
      WHERE upper(p.slug)=upper($1)
        AND EXISTS (
          SELECT 1 FROM player_team_years visible_link
          JOIN teams visible_team ON visible_team.id = visible_link.team_id AND visible_team.active = true
          WHERE visible_link.player_id = p.id
        )
    `, [slug]) as Array<Record<string, unknown>>;
    if (!player) throw new NotFoundException('Jogador não encontrado.');
    const teams = await this.dataSource.query(`
      SELECT pty.id, pty.year, t.id AS "teamId", t.name AS "teamName", t.slug AS "teamSlug",
             pty.overall, pty.firepower, pty.entrying, pty.trading, pty.opening,
             pty.clutching, pty.sniping, pty.utility
      FROM player_team_years pty JOIN teams t ON t.id=pty.team_id AND t.active = true
      WHERE pty.player_id=$1 ORDER BY pty.year DESC, t.name
    `, [player.id]);
    return { ...player, teams };
  }

  private page(data: Array<Record<string, unknown>>, total: number, query: CatalogQueryDto) {
    return { data, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }
}
