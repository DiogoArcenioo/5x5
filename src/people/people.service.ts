import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePlayerDto, PeopleListDto, UpdatePlayerDto } from './dto/people.dto';

const SKILLS = ['firepower', 'entrying', 'trading', 'opening', 'clutching', 'sniping', 'utility'] as const;

@Injectable()
export class PeopleService {
  constructor(private readonly dataSource: DataSource) {}

  async listPlayers(query: PeopleListDto): Promise<Record<string, unknown>> {
    const values: unknown[] = [];
    const conditions: string[] = [];
    const add = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (query.search) {
      const term = add(`%${query.search.trim()}%`);
      conditions.push(`(p.nickname ILIKE ${term} OR p.display_name ILIKE ${term})`);
    }
    if (query.status) conditions.push(`p.career_status = ${add(query.status)}`);
    if (query.countryId) conditions.push(`p.country_id = ${add(query.countryId)}`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    const limit = add(query.pageSize);
    const offset = add((query.page - 1) * query.pageSize);

    const data = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.display_name AS "displayName", p.slug,
             p.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName",
             p.birth_date AS "birthDate", p.career_status AS "careerStatus",
             p.overall, p.firepower, p.entrying, p.trading, p.opening,
             p.clutching, p.sniping, p.utility
      FROM players p
      LEFT JOIN countries c ON c.id = p.country_id
      ${where}
      ORDER BY p.overall DESC, p.nickname
      LIMIT ${limit} OFFSET ${offset}
    `, values) as Array<Record<string, unknown>>;
    const [count] = await this.dataSource.query(
      `SELECT count(*)::integer AS total FROM players p ${where}`,
      countValues,
    ) as Array<{ total: number }>;
    return this.page(data, count.total, query);
  }

  async getPlayer(id: number): Promise<Record<string, unknown>> {
    const [player] = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.display_name AS "displayName", p.slug,
             p.country_id AS "countryId", c.code AS "countryCode", c.name AS "countryName",
             p.birth_date AS "birthDate", p.career_status AS "careerStatus",
             p.overall, p.firepower, p.entrying, p.trading, p.opening,
             p.clutching, p.sniping, p.utility
      FROM players p LEFT JOIN countries c ON c.id = p.country_id
      WHERE p.id = $1
    `, [id]) as Array<Record<string, unknown>>;
    if (!player) throw new NotFoundException('Jogador não encontrado.');
    const links = await this.dataSource.query(`
      SELECT pty.id, pty.year, t.id AS "teamId", t.name AS "teamName", t.slug AS "teamSlug"
      FROM player_team_years pty JOIN teams t ON t.id = pty.team_id
      WHERE pty.player_id = $1 ORDER BY pty.year DESC, t.name
    `, [id]);
    return { ...player, links };
  }

  async createPlayer(dto: CreatePlayerDto): Promise<Record<string, unknown>> {
    const skills = this.skills(dto);
    const [created] = await this.dataSource.query(`
      INSERT INTO players (
        nickname, display_name, slug, country_id, birth_date, career_status,
        overall, firepower, entrying, trading, opening, clutching, sniping, utility
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id
    `, [
      this.upper(dto.nickname), this.upper(dto.displayName), this.upper(dto.slug),
      dto.countryId ?? null, dto.birthDate ?? null, dto.careerStatus,
      this.overall(skills), ...SKILLS.map((skill) => skills[skill]),
    ]) as Array<{ id: number }>;
    return this.getPlayer(created.id);
  }

  async updatePlayer(id: number, dto: UpdatePlayerDto): Promise<Record<string, unknown>> {
    const current = await this.getPlayer(id);
    const merged = { ...current, ...dto } as unknown as CreatePlayerDto;
    const skills = this.skills(merged);
    const updated = await this.dataSource.query(`
      UPDATE players SET
        nickname=$2, display_name=$3, slug=$4, country_id=$5, birth_date=$6,
        career_status=$7, overall=$8, firepower=$9, entrying=$10, trading=$11,
        opening=$12, clutching=$13, sniping=$14, utility=$15, updated_at=now()
      WHERE id=$1
      RETURNING id
    `, [
      id, this.upper(merged.nickname), this.upper(merged.displayName), this.upper(merged.slug),
      merged.countryId ?? null, merged.birthDate ?? null, merged.careerStatus,
      this.overall(skills), ...SKILLS.map((skill) => skills[skill]),
    ]);
    if (!updated[0]) throw new NotFoundException('Jogador não encontrado.');
    return this.getPlayer(id);
  }

  async removePlayer(id: number): Promise<{ deleted: true }> {
    const deleted = await this.dataSource.query('DELETE FROM players WHERE id = $1 RETURNING id', [id]);
    if (!deleted[0]) throw new NotFoundException('Jogador não encontrado.');
    return { deleted: true };
  }

  private skills(dto: CreatePlayerDto): Record<(typeof SKILLS)[number], number> {
    return Object.fromEntries(SKILLS.map((skill) => [skill, Number(dto[skill])])) as Record<(typeof SKILLS)[number], number>;
  }

  private overall(skills: Record<(typeof SKILLS)[number], number>): number {
    return Math.round(SKILLS.reduce((total, skill) => total + skills[skill], 0) / SKILLS.length);
  }

  private upper(value: string): string {
    return value.trim().toUpperCase();
  }

  private page(data: Array<Record<string, unknown>>, total: number, query: PeopleListDto) {
    return { data, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }
}
