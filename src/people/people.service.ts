import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  CoachEntity,
  PersonEntity,
  PlayerAliasEntity,
  PlayerEntity,
} from '../database/entities';
import {
  CreateCoachDto,
  CreatePlayerDto,
  PeopleListDto,
  UpdateCoachDto,
  UpdatePlayerDto,
} from './dto/people.dto';

@Injectable()
export class PeopleService {
  constructor(private readonly dataSource: DataSource) {}

  async listPlayers(query: PeopleListDto): Promise<Record<string, unknown>> {
    const parameters: unknown[] = [];
    const conditions: string[] = [];
    const addParameter = (value: unknown): string => {
      parameters.push(value);
      return `$${parameters.length}`;
    };

    if (query.search) {
      const parameter = addParameter(`%${query.search.trim()}%`);
      conditions.push(`(p.nickname ILIKE ${parameter} OR p.slug ILIKE ${parameter} OR pe.display_name ILIKE ${parameter})`);
    }
    if (query.status) conditions.push(`p.career_status = ${addParameter(query.status)}`);
    if (query.nationalityCode) conditions.push(`pe.nationality_code = ${addParameter(query.nationalityCode)}`);

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countParameters = [...parameters];
    const limit = addParameter(query.pageSize);
    const offset = addParameter((query.page - 1) * query.pageSize);

    const rows = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.slug, p.debut_date AS "debutDate",
             p.retirement_date AS "retirementDate", p.career_status AS "careerStatus",
             pe.display_name AS "displayName", pe.legal_name AS "legalName",
             pe.birth_date AS "birthDate", pe.nationality_code AS "nationalityCode",
             pe.secondary_nationality_code AS "secondaryNationalityCode"
      FROM players p
      JOIN people pe ON pe.id = p.id
      ${where}
      ORDER BY p.nickname ASC
      LIMIT ${limit} OFFSET ${offset}
    `, parameters) as Array<Record<string, unknown>>;
    const countRows = await this.dataSource.query(`
      SELECT count(*)::integer AS total
      FROM players p JOIN people pe ON pe.id = p.id ${where}
    `, countParameters) as Array<{ total: number }>;

    return this.paginated(rows, countRows[0].total, query);
  }

  async getPlayer(id: string): Promise<Record<string, unknown>> {
    const rows = await this.dataSource.query(`
      SELECT p.id, p.nickname, p.slug, p.debut_date AS "debutDate",
             p.retirement_date AS "retirementDate", p.career_status AS "careerStatus",
             pe.display_name AS "displayName", pe.legal_name AS "legalName",
             pe.birth_date AS "birthDate", pe.nationality_code AS "nationalityCode",
             pe.secondary_nationality_code AS "secondaryNationalityCode"
      FROM players p JOIN people pe ON pe.id = p.id WHERE p.id = $1
    `, [id]) as Array<Record<string, unknown>>;
    if (!rows[0]) throw new NotFoundException('Jogador não encontrado.');

    const [aliases, memberships, versions, externalReferences] = await Promise.all([
      this.dataSource.getRepository(PlayerAliasEntity).find({ where: { playerId: id } }),
      this.dataSource.query('SELECT * FROM player_team_memberships WHERE player_id = $1 ORDER BY starts_on DESC', [id]),
      this.dataSource.query('SELECT * FROM player_versions WHERE player_id = $1 ORDER BY reference_date DESC', [id]),
      this.dataSource.query('SELECT * FROM player_external_references WHERE player_id = $1', [id]),
    ]);
    return { ...rows[0], aliases, memberships, versions, externalReferences };
  }

  createPlayer(dto: CreatePlayerDto): Promise<Record<string, unknown>> {
    return this.dataSource.transaction(async (manager) => {
      const person = await manager.getRepository(PersonEntity).save(manager.getRepository(PersonEntity).create({
        displayName: dto.displayName,
        legalName: dto.legalName,
        birthDate: dto.birthDate,
        nationalityCode: dto.nationalityCode?.toUpperCase(),
        secondaryNationalityCode: dto.secondaryNationalityCode?.toUpperCase(),
      }));
      await manager.getRepository(PlayerEntity).save(manager.getRepository(PlayerEntity).create({
        id: person.id,
        nickname: dto.nickname,
        slug: dto.slug,
        debutDate: dto.debutDate,
        retirementDate: dto.retirementDate,
        careerStatus: dto.careerStatus,
      }));
      if (dto.aliases?.length) {
        await this.saveAliases(manager, person.id as string, dto.aliases);
      }
      return this.getPlayerWithin(manager, person.id as string);
    });
  }

  updatePlayer(id: string, dto: UpdatePlayerDto): Promise<Record<string, unknown>> {
    return this.dataSource.transaction(async (manager) => {
      const personRepository = manager.getRepository(PersonEntity);
      const playerRepository = manager.getRepository(PlayerEntity);
      const person = await personRepository.findOne({ where: { id } });
      const player = await playerRepository.findOne({ where: { id } });
      if (!person || !player) throw new NotFoundException('Jogador não encontrado.');

      const personFields = this.pick(dto, ['displayName', 'legalName', 'birthDate', 'nationalityCode', 'secondaryNationalityCode']);
      if (typeof personFields.nationalityCode === 'string') personFields.nationalityCode = personFields.nationalityCode.toUpperCase();
      if (typeof personFields.secondaryNationalityCode === 'string') personFields.secondaryNationalityCode = personFields.secondaryNationalityCode.toUpperCase();
      const playerFields = this.pick(dto, ['nickname', 'slug', 'debutDate', 'retirementDate', 'careerStatus']);
      await personRepository.save(personRepository.merge(person, personFields));
      await playerRepository.save(playerRepository.merge(player, playerFields));
      if (dto.aliases) {
        await manager.getRepository(PlayerAliasEntity).delete({ playerId: id });
        await this.saveAliases(manager, id, dto.aliases);
      }
      return this.getPlayerWithin(manager, id);
    });
  }

  async removePlayer(id: string): Promise<{ deleted: true }> {
    const person = await this.dataSource.getRepository(PersonEntity).findOne({ where: { id } });
    if (!person) throw new NotFoundException('Jogador não encontrado.');
    try {
      await this.dataSource.getRepository(PersonEntity).remove(person);
      return { deleted: true };
    } catch {
      throw new ConflictException('O jogador possui histórico vinculado e não pode ser excluído. Prefira marcá-lo como inativo ou aposentado.');
    }
  }

  async listCoaches(query: PeopleListDto): Promise<Record<string, unknown>> {
    const values: unknown[] = [];
    const conditions: string[] = [];
    const add = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (query.search) conditions.push(`pe.display_name ILIKE ${add(`%${query.search.trim()}%`)}`);
    if (query.status) conditions.push(`c.career_status = ${add(query.status)}`);
    if (query.nationalityCode) conditions.push(`pe.nationality_code = ${add(query.nationalityCode)}`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    const limit = add(query.pageSize);
    const offset = add((query.page - 1) * query.pageSize);
    const rows = await this.dataSource.query(`
      SELECT c.id, c.coach_since AS "coachSince", c.career_status AS "careerStatus",
             pe.display_name AS "displayName", pe.legal_name AS "legalName",
             pe.birth_date AS "birthDate", pe.nationality_code AS "nationalityCode",
             pe.secondary_nationality_code AS "secondaryNationalityCode"
      FROM coaches c JOIN people pe ON pe.id = c.id ${where}
      ORDER BY pe.display_name LIMIT ${limit} OFFSET ${offset}
    `, values) as Array<Record<string, unknown>>;
    const count = await this.dataSource.query(`SELECT count(*)::integer AS total FROM coaches c JOIN people pe ON pe.id = c.id ${where}`, countValues) as Array<{ total: number }>;
    return this.paginated(rows, count[0].total, query);
  }

  async getCoach(id: string): Promise<Record<string, unknown>> {
    const rows = await this.dataSource.query(`
      SELECT c.id, c.coach_since AS "coachSince", c.career_status AS "careerStatus",
             pe.display_name AS "displayName", pe.legal_name AS "legalName",
             pe.birth_date AS "birthDate", pe.nationality_code AS "nationalityCode",
             pe.secondary_nationality_code AS "secondaryNationalityCode"
      FROM coaches c JOIN people pe ON pe.id = c.id WHERE c.id = $1
    `, [id]) as Array<Record<string, unknown>>;
    if (!rows[0]) throw new NotFoundException('Coach não encontrado.');
    const [memberships, versions] = await Promise.all([
      this.dataSource.query('SELECT * FROM coach_team_memberships WHERE coach_id = $1 ORDER BY starts_on DESC', [id]),
      this.dataSource.query('SELECT * FROM coach_versions WHERE coach_id = $1', [id]),
    ]);
    return { ...rows[0], memberships, versions };
  }

  createCoach(dto: CreateCoachDto): Promise<Record<string, unknown>> {
    return this.dataSource.transaction(async (manager) => {
      const person = await manager.getRepository(PersonEntity).save(manager.getRepository(PersonEntity).create({
        displayName: dto.displayName,
        legalName: dto.legalName,
        birthDate: dto.birthDate,
        nationalityCode: dto.nationalityCode?.toUpperCase(),
        secondaryNationalityCode: dto.secondaryNationalityCode?.toUpperCase(),
      }));
      await manager.getRepository(CoachEntity).save(manager.getRepository(CoachEntity).create({
        id: person.id,
        coachSince: dto.coachSince,
        careerStatus: dto.careerStatus,
      }));
      return this.getCoachWithin(manager, person.id as string);
    });
  }

  updateCoach(id: string, dto: UpdateCoachDto): Promise<Record<string, unknown>> {
    return this.dataSource.transaction(async (manager) => {
      const personRepository = manager.getRepository(PersonEntity);
      const coachRepository = manager.getRepository(CoachEntity);
      const person = await personRepository.findOne({ where: { id } });
      const coach = await coachRepository.findOne({ where: { id } });
      if (!person || !coach) throw new NotFoundException('Coach não encontrado.');
      const personFields = this.pick(dto, ['displayName', 'legalName', 'birthDate', 'nationalityCode', 'secondaryNationalityCode']);
      if (typeof personFields.nationalityCode === 'string') personFields.nationalityCode = personFields.nationalityCode.toUpperCase();
      if (typeof personFields.secondaryNationalityCode === 'string') personFields.secondaryNationalityCode = personFields.secondaryNationalityCode.toUpperCase();
      await personRepository.save(personRepository.merge(person, personFields));
      await coachRepository.save(coachRepository.merge(coach, this.pick(dto, ['coachSince', 'careerStatus'])));
      return this.getCoachWithin(manager, id);
    });
  }

  async removeCoach(id: string): Promise<{ deleted: true }> {
    const person = await this.dataSource.getRepository(PersonEntity).findOne({ where: { id } });
    if (!person) throw new NotFoundException('Coach não encontrado.');
    try {
      await this.dataSource.getRepository(PersonEntity).remove(person);
      return { deleted: true };
    } catch {
      throw new ConflictException('O coach possui histórico vinculado e não pode ser excluído. Prefira marcá-lo como inativo ou aposentado.');
    }
  }

  private async saveAliases(manager: EntityManager, playerId: string, aliases: Array<{ alias: string; aliasType: string }>) {
    const repository = manager.getRepository(PlayerAliasEntity);
    const records = aliases.map((item) => repository.create({
      playerId,
      alias: item.alias.trim(),
      normalizedAlias: item.alias.trim().toLocaleLowerCase('pt-BR'),
      aliasType: item.aliasType,
    }));
    await repository.save(records);
  }

  private async getPlayerWithin(manager: EntityManager, id: string): Promise<Record<string, unknown>> {
    const person = await manager.getRepository(PersonEntity).findOneByOrFail({ id });
    const player = await manager.getRepository(PlayerEntity).findOneByOrFail({ id });
    const aliases = await manager.getRepository(PlayerAliasEntity).find({ where: { playerId: id } });
    return { ...person, ...player, aliases };
  }

  private async getCoachWithin(manager: EntityManager, id: string): Promise<Record<string, unknown>> {
    const person = await manager.getRepository(PersonEntity).findOneByOrFail({ id });
    const coach = await manager.getRepository(CoachEntity).findOneByOrFail({ id });
    return { ...person, ...coach };
  }

  private pick(source: object, fields: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const record = source as Record<string, unknown>;
    for (const field of fields) if (record[field] !== undefined) result[field] = record[field];
    return result;
  }

  private paginated(data: Array<Record<string, unknown>>, total: number, query: PeopleListDto) {
    return { data, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }
}
