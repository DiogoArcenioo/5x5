import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly dataSource: DataSource) {}

  async summary(): Promise<Record<string, unknown>> {
    const [counts] = await this.dataSource.query(`
      SELECT
        (SELECT count(*)::integer FROM players) AS players,
        (SELECT count(*)::integer FROM teams) AS teams,
        (SELECT count(*)::integer FROM seasons) AS seasons,
        (SELECT count(*)::integer FROM tournament_editions) AS tournaments,
        (SELECT count(*)::integer FROM player_versions WHERE is_draft_eligible) AS "draftEligibleVersions",
        (SELECT count(*)::integer FROM player_versions pv
          JOIN player_version_game_ratings gr ON gr.player_version_id = pv.id
          WHERE pv.is_draft_eligible) AS "ratedDraftVersions"
    `) as Array<Record<string, unknown>>;
    return counts;
  }

  async teams(query: CatalogQueryDto): Promise<Record<string, unknown>> {
    const values: unknown[] = [];
    const conditions: string[] = [];
    const add = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (query.search) {
      const term = add(`%${query.search.trim()}%`);
      conditions.push(`(t.name ILIKE ${term} OR t.short_name ILIKE ${term})`);
    }
    if (query.countryCode) conditions.push(`t.country_code = ${add(query.countryCode.toUpperCase())}`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    const limit = add(query.pageSize);
    const offset = add((query.page - 1) * query.pageSize);
    const data = await this.dataSource.query(`
      SELECT t.id, t.name, t.short_name AS "shortName", t.slug,
             t.country_code AS "countryCode", c.name AS "countryName",
             r.name AS "regionName", t.founded_on AS "foundedOn",
             t.disbanded_on AS "disbandedOn", (t.disbanded_on IS NULL) AS active,
             (SELECT count(DISTINCT ptm.player_id)::integer
                FROM player_team_memberships ptm WHERE ptm.team_id = t.id) AS "playerCount",
             (SELECT count(*)::integer FROM lineups l WHERE l.team_id = t.id) AS "lineupCount"
      FROM teams t
      LEFT JOIN countries c ON c.code = t.country_code
      LEFT JOIN regions r ON r.id = c.region_id
      ${where}
      ORDER BY t.name
      LIMIT ${limit} OFFSET ${offset}
    `, values) as Array<Record<string, unknown>>;
    const [count] = await this.dataSource.query(`SELECT count(*)::integer AS total FROM teams t ${where}`, countValues) as Array<{ total: number }>;
    return this.page(data, count.total, query);
  }

  async team(slug: string): Promise<Record<string, unknown>> {
    const [team] = await this.dataSource.query(`
      SELECT t.id, t.name, t.short_name AS "shortName", t.slug,
             t.country_code AS "countryCode", c.name AS "countryName",
             r.name AS "regionName", t.founded_on AS "foundedOn",
             t.disbanded_on AS "disbandedOn", (t.disbanded_on IS NULL) AS active
      FROM teams t
      LEFT JOIN countries c ON c.code = t.country_code
      LEFT JOIN regions r ON r.id = c.region_id
      WHERE t.slug = $1
    `, [slug]) as Array<Record<string, unknown>>;
    if (!team) throw new NotFoundException('Time não encontrado.');
    const id = team.id;
    const [players, lineups, tournaments] = await Promise.all([
      this.dataSource.query(`
        SELECT DISTINCT ON (p.id) p.id, p.nickname, p.slug, p.career_status AS "careerStatus",
               pe.display_name AS "displayName", pe.nationality_code AS "nationalityCode",
               ptm.starts_on AS "startsOn", ptm.ends_on AS "endsOn", ptm.roster_status AS "rosterStatus"
        FROM player_team_memberships ptm
        JOIN players p ON p.id = ptm.player_id JOIN people pe ON pe.id = p.id
        WHERE ptm.team_id = $1
        ORDER BY p.id, ptm.starts_on DESC
      `, [id]),
      this.dataSource.query(`
        SELECT l.id, l.name, l.starts_on AS "startsOn", l.ends_on AS "endsOn",
               s.code AS "seasonCode", s.name AS "seasonName",
               (SELECT count(*)::integer FROM lineup_members lm WHERE lm.lineup_id = l.id) AS "memberCount"
        FROM lineups l JOIN seasons s ON s.id = l.season_id
        WHERE l.team_id = $1 ORDER BY l.starts_on DESC
      `, [id]),
      this.dataSource.query(`
        SELECT te.id, te.name, te.starts_on AS "startsOn", te.is_major AS "isMajor",
               e.final_placement AS "finalPlacement", e.stage_reached AS "stageReached"
        FROM tournament_entries e JOIN tournament_editions te ON te.id = e.edition_id
        WHERE e.team_id = $1 ORDER BY te.starts_on DESC
      `, [id]),
    ]);
    return { ...team, players, lineups, tournaments };
  }

  async players(query: CatalogQueryDto): Promise<Record<string, unknown>> {
    const values: unknown[] = [];
    const conditions: string[] = [];
    const add = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (query.search) {
      const term = add(`%${query.search.trim()}%`);
      conditions.push(`(p.nickname ILIKE ${term} OR pe.display_name ILIKE ${term})`);
    }
    if (query.status) conditions.push(`p.career_status = ${add(query.status)}`);
    if (query.countryCode) conditions.push(`pe.nationality_code = ${add(query.countryCode.toUpperCase())}`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    const limit = add(query.pageSize);
    const offset = add((query.page - 1) * query.pageSize);
    const data = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.slug, p.debut_date AS "debutDate",
             p.retirement_date AS "retirementDate", p.career_status AS "careerStatus",
             pe.display_name AS "displayName", pe.birth_date AS "birthDate",
             pe.nationality_code AS "nationalityCode", c.name AS "countryName", r.name AS "regionName",
             current_version.id AS "playerVersionId", current_version."seasonName",
             current_version."seasonCode", current_version."teamName", current_version."teamSlug",
             current_version."gameOverall", current_version.roles,
             majors."majorAppearances", majors."majorWins", majors."bestMajorPlacement"
      FROM players p JOIN people pe ON pe.id = p.id
      LEFT JOIN countries c ON c.code = pe.nationality_code LEFT JOIN regions r ON r.id = c.region_id
      LEFT JOIN LATERAL (
        SELECT pv.id, s.name AS "seasonName", s.code AS "seasonCode",
               t.name AS "teamName", t.slug AS "teamSlug", gr.game_overall AS "gameOverall",
               COALESCE((SELECT jsonb_agg(jsonb_build_object('code', ro.code, 'name', ro.name, 'proficiency', pvr.proficiency, 'primary', pvr.is_primary) ORDER BY pvr.priority)
                 FROM player_version_roles pvr JOIN roles ro ON ro.id = pvr.role_id
                 WHERE pvr.player_version_id = pv.id), '[]'::jsonb) AS roles
        FROM player_versions pv JOIN seasons s ON s.id = pv.season_id JOIN teams t ON t.id = pv.team_id
        LEFT JOIN player_version_game_ratings gr ON gr.player_version_id = pv.id
        WHERE pv.player_id = p.id ORDER BY pv.reference_date DESC LIMIT 1
      ) current_version ON true
      LEFT JOIN LATERAL (
        SELECT (count(DISTINCT te.id) FILTER (WHERE te.is_major))::integer AS "majorAppearances",
               (count(DISTINCT te.id) FILTER (WHERE te.is_major AND e.final_placement = 1))::integer AS "majorWins",
               min(e.final_placement) FILTER (WHERE te.is_major) AS "bestMajorPlacement"
        FROM tournament_roster_members trm JOIN tournament_entries e ON e.id = trm.entry_id
        JOIN tournament_editions te ON te.id = e.edition_id JOIN player_versions pv2 ON pv2.id = trm.player_version_id
        WHERE pv2.player_id = p.id
      ) majors ON true
      ${where}
      ORDER BY p.nickname
      LIMIT ${limit} OFFSET ${offset}
    `, values) as Array<Record<string, unknown>>;
    const [count] = await this.dataSource.query(`SELECT count(*)::integer AS total FROM players p JOIN people pe ON pe.id = p.id ${where}`, countValues) as Array<{ total: number }>;
    return this.page(data, count.total, query);
  }

  async player(slug: string): Promise<Record<string, unknown>> {
    const [player] = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.slug, p.debut_date AS "debutDate", p.retirement_date AS "retirementDate",
             p.career_status AS "careerStatus", pe.display_name AS "displayName", pe.legal_name AS "legalName",
             pe.birth_date AS "birthDate", pe.nationality_code AS "nationalityCode",
             c.name AS "countryName", r.name AS "regionName"
      FROM players p JOIN people pe ON pe.id = p.id
      LEFT JOIN countries c ON c.code = pe.nationality_code LEFT JOIN regions r ON r.id = c.region_id
      WHERE p.slug = $1
    `, [slug]) as Array<Record<string, unknown>>;
    if (!player) throw new NotFoundException('Jogador não encontrado.');
    const id = player.id;
    const [aliases, memberships, versions, performancePeriods, majors] = await Promise.all([
      this.dataSource.query('SELECT alias, alias_type AS "aliasType" FROM player_aliases WHERE player_id = $1 ORDER BY alias', [id]),
      this.dataSource.query(`
        SELECT ptm.id, t.name AS "teamName", t.slug AS "teamSlug", ptm.starts_on AS "startsOn",
               ptm.ends_on AS "endsOn", ptm.roster_status AS "rosterStatus"
        FROM player_team_memberships ptm JOIN teams t ON t.id = ptm.team_id
        WHERE ptm.player_id = $1 ORDER BY ptm.starts_on DESC
      `, [id]),
      this.dataSource.query(`
        SELECT pv.id, pv.version_label AS "versionLabel", pv.reference_date AS "referenceDate",
               pv.is_draft_eligible AS "isDraftEligible", pv.data_quality AS "dataQuality",
               t.name AS "teamName", t.slug AS "teamSlug", s.name AS "seasonName", s.code AS "seasonCode",
               gr.game_overall AS "gameOverall", gr.aim, gr.impact, gr.consistency, gr.clutch,
               gr.experience, gr.leadership, gr.awp, gr.entry, gr.support, gr.season_form AS "seasonForm",
               COALESCE((SELECT jsonb_agg(jsonb_build_object('code', ro.code, 'name', ro.name, 'proficiency', pvr.proficiency, 'primary', pvr.is_primary) ORDER BY pvr.priority)
                 FROM player_version_roles pvr JOIN roles ro ON ro.id = pvr.role_id WHERE pvr.player_version_id = pv.id), '[]'::jsonb) AS roles,
               COALESCE((SELECT jsonb_agg(jsonb_build_object('map', m.name, 'performance', pmr.performance_rating, 'experience', pmr.experience_rating, 'sample', pmr.sample_size_maps, 'confidence', pmr.confidence))
                 FROM player_version_map_ratings pmr JOIN maps m ON m.id = pmr.map_id WHERE pmr.player_version_id = pv.id), '[]'::jsonb) AS maps
        FROM player_versions pv JOIN teams t ON t.id = pv.team_id JOIN seasons s ON s.id = pv.season_id
        LEFT JOIN player_version_game_ratings gr ON gr.player_version_id = pv.id
        WHERE pv.player_id = $1 ORDER BY pv.reference_date DESC
      `, [id]),
      this.dataSource.query(`
        SELECT pp.id, pp.period_type AS "periodType", pp.starts_on AS "startsOn", pp.ends_on AS "endsOn",
               pp.is_partial AS "isPartial", pp.game_version AS "gameVersion", pp.maps_played AS "mapsPlayed",
               pp.rating_system AS "ratingSystem", pp.data_quality AS "dataQuality", dp.name AS "providerName",
               sc.rating, sc.firepower, sc.entrying, sc.trading, sc.opening, sc.clutching, sc.sniping, sc.utility
        FROM player_performance_periods pp JOIN data_providers dp ON dp.id = pp.provider_id
        LEFT JOIN player_source_attribute_scores sc ON sc.performance_period_id = pp.id
        WHERE pp.player_id = $1 ORDER BY pp.ends_on DESC, pp.captured_at DESC
      `, [id]),
      this.dataSource.query(`
        SELECT te.name, te.starts_on AS "startsOn", te.is_major AS "isMajor", t.name AS "teamName",
               e.final_placement AS "finalPlacement", e.stage_reached AS "stageReached", trm.maps_played AS "mapsPlayed"
        FROM tournament_roster_members trm JOIN player_versions pv ON pv.id = trm.player_version_id
        JOIN tournament_entries e ON e.id = trm.entry_id JOIN tournament_editions te ON te.id = e.edition_id
        JOIN teams t ON t.id = e.team_id WHERE pv.player_id = $1 ORDER BY te.starts_on DESC
      `, [id]),
    ]);
    return { ...player, aliases, memberships, versions, performancePeriods, majors };
  }

  async seasons(): Promise<Array<Record<string, unknown>>> {
    return this.dataSource.query(`
      SELECT s.id, s.code, s.name, s.year, s.starts_on AS "startsOn", s.ends_on AS "endsOn",
             s.game_version AS "gameVersion", s.is_draft_enabled AS "isDraftEnabled",
             (SELECT count(*)::integer FROM player_versions pv WHERE pv.season_id = s.id) AS "playerVersionCount",
             COALESCE((SELECT jsonb_agg(jsonb_build_object('code', m.code, 'name', m.name) ORDER BY m.name)
               FROM season_map_pool smp JOIN maps m ON m.id = smp.map_id WHERE smp.season_id = s.id), '[]'::jsonb) AS maps
      FROM seasons s ORDER BY s.starts_on DESC
    `) as Promise<Array<Record<string, unknown>>>;
  }

  async tournaments(): Promise<Array<Record<string, unknown>>> {
    return this.dataSource.query(`
      SELECT te.id, te.name, te.starts_on AS "startsOn", te.ends_on AS "endsOn", te.game_version AS "gameVersion",
             te.is_major AS "isMajor", te.tier, t.name AS "seriesName", t.organizer,
             c.name AS "countryName", s.name AS "seasonName",
             (SELECT count(*)::integer FROM tournament_entries e WHERE e.edition_id = te.id) AS participants,
             (SELECT tm.name FROM tournament_entries e JOIN teams tm ON tm.id = e.team_id
               WHERE e.edition_id = te.id AND e.final_placement = 1 LIMIT 1) AS champion
      FROM tournament_editions te JOIN tournaments t ON t.id = te.tournament_id
      JOIN seasons s ON s.id = te.season_id LEFT JOIN countries c ON c.code = te.location_country_code
      ORDER BY te.starts_on DESC
    `) as Promise<Array<Record<string, unknown>>>;
  }

  private page(data: Array<Record<string, unknown>>, total: number, query: CatalogQueryDto) {
    return { data, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }
}
