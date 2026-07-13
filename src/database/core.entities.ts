import { EntitySchema } from 'typeorm';
import { createdAt, identitySmallint, updatedAt, uuidId } from './entity-helpers';

export const RegionEntity = new EntitySchema({
  name: 'Region', tableName: 'regions',
  columns: {
    id: identitySmallint,
    code: { type: 'varchar', length: 20, unique: true },
    name: { type: 'varchar', length: 80 },
  },
});

export const CountryEntity = new EntitySchema({
  name: 'Country', tableName: 'countries',
  columns: {
    code: { type: 'char', length: 2, primary: true },
    name: { type: 'varchar', length: 100 },
    regionId: { name: 'region_id', type: 'smallint', nullable: true },
  },
});

export const SeasonEntity = new EntitySchema({
  name: 'Season', tableName: 'seasons',
  columns: {
    id: uuidId,
    code: { type: 'varchar', length: 30, unique: true },
    name: { type: 'varchar', length: 100 },
    year: { type: 'smallint' },
    startsOn: { name: 'starts_on', type: 'date' },
    endsOn: { name: 'ends_on', type: 'date' },
    gameVersion: { name: 'game_version', type: 'varchar', length: 20 },
    isDraftEnabled: { name: 'is_draft_enabled', type: 'boolean', default: false },
  },
});

export const PersonEntity = new EntitySchema({
  name: 'Person', tableName: 'people',
  columns: {
    id: uuidId,
    displayName: { name: 'display_name', type: 'varchar', length: 120 },
    legalName: { name: 'legal_name', type: 'varchar', length: 160, nullable: true },
    birthDate: { name: 'birth_date', type: 'date', nullable: true },
    nationalityCode: { name: 'nationality_code', type: 'char', length: 2, nullable: true },
    secondaryNationalityCode: { name: 'secondary_nationality_code', type: 'char', length: 2, nullable: true },
    createdAt,
    updatedAt,
  },
});

export const PlayerEntity = new EntitySchema({
  name: 'Player', tableName: 'players',
  columns: {
    id: { type: 'uuid', primary: true },
    nickname: { type: 'varchar', length: 60 },
    slug: { type: 'varchar', length: 80, unique: true },
    debutDate: { name: 'debut_date', type: 'date', nullable: true },
    retirementDate: { name: 'retirement_date', type: 'date', nullable: true },
    careerStatus: { name: 'career_status', type: 'varchar', length: 20 },
  },
});

export const PlayerAliasEntity = new EntitySchema({
  name: 'PlayerAlias', tableName: 'player_aliases',
  columns: {
    id: uuidId,
    playerId: { name: 'player_id', type: 'uuid' },
    alias: { type: 'varchar', length: 100 },
    normalizedAlias: { name: 'normalized_alias', type: 'varchar', length: 100 },
    aliasType: { name: 'alias_type', type: 'varchar', length: 20 },
  },
});

export const CoachEntity = new EntitySchema({
  name: 'Coach', tableName: 'coaches',
  columns: {
    id: { type: 'uuid', primary: true },
    coachSince: { name: 'coach_since', type: 'date', nullable: true },
    careerStatus: { name: 'career_status', type: 'varchar', length: 20 },
  },
});

export const TeamEntity = new EntitySchema({
  name: 'Team', tableName: 'teams',
  columns: {
    id: uuidId,
    name: { type: 'varchar', length: 120 },
    shortName: { name: 'short_name', type: 'varchar', length: 20, nullable: true },
    slug: { type: 'varchar', length: 140, unique: true },
    countryCode: { name: 'country_code', type: 'char', length: 2, nullable: true },
    foundedOn: { name: 'founded_on', type: 'date', nullable: true },
    disbandedOn: { name: 'disbanded_on', type: 'date', nullable: true },
  },
});

export const RoleEntity = new EntitySchema({
  name: 'Role', tableName: 'roles',
  columns: {
    id: identitySmallint,
    code: { type: 'varchar', length: 30, unique: true },
    name: { type: 'varchar', length: 60 },
    category: { type: 'varchar', length: 30 },
    isAssignable: { name: 'is_assignable', type: 'boolean', default: true },
  },
});

export const MapEntity = new EntitySchema({
  name: 'Map', tableName: 'maps',
  columns: {
    id: identitySmallint,
    code: { type: 'varchar', length: 30, unique: true },
    name: { type: 'varchar', length: 60 },
    activeFrom: { name: 'active_from', type: 'date', nullable: true },
    activeUntil: { name: 'active_until', type: 'date', nullable: true },
    isActive: { name: 'is_active', type: 'boolean', default: true },
  },
});

export const DataProviderEntity = new EntitySchema({
  name: 'DataProvider', tableName: 'data_providers',
  columns: {
    id: identitySmallint,
    code: { type: 'varchar', length: 30, unique: true },
    name: { type: 'varchar', length: 100 },
    baseUrl: { name: 'base_url', type: 'text', nullable: true },
    usageStatus: { name: 'usage_status', type: 'varchar', length: 30 },
    licenseNotes: { name: 'license_notes', type: 'text', nullable: true },
    isActive: { name: 'is_active', type: 'boolean', default: true },
  },
});

export const HintTypeEntity = new EntitySchema({
  name: 'HintType', tableName: 'hint_types',
  columns: {
    id: identitySmallint,
    code: { type: 'varchar', length: 40, unique: true },
    name: { type: 'varchar', length: 100 },
    scoreCost: { name: 'score_cost', type: 'smallint' },
    resolverKey: { name: 'resolver_key', type: 'varchar', length: 80 },
    displayOrder: { name: 'display_order', type: 'smallint' },
    isActive: { name: 'is_active', type: 'boolean', default: true },
  },
});

export const AppUserEntity = new EntitySchema({
  name: 'AppUser', tableName: 'app_users',
  columns: {
    id: uuidId,
    username: { type: 'varchar', length: 50 },
    usernameNormalized: { name: 'username_normalized', type: 'varchar', length: 50, unique: true },
    email: { type: 'varchar', length: 254, nullable: true },
    emailNormalized: { name: 'email_normalized', type: 'varchar', length: 254, nullable: true, unique: true },
    passwordHash: { name: 'password_hash', type: 'text' },
    role: { type: 'varchar', length: 20, default: 'user' },
    status: { type: 'varchar', length: 20, default: 'active' },
    lastLoginAt: { name: 'last_login_at', type: 'timestamptz', nullable: true },
    createdAt,
    updatedAt,
  },
});

export const UserSessionEntity = new EntitySchema({
  name: 'UserSession', tableName: 'user_sessions',
  columns: {
    id: uuidId,
    userId: { name: 'user_id', type: 'uuid' },
    tokenHash: { name: 'token_hash', type: 'char', length: 64, unique: true },
    expiresAt: { name: 'expires_at', type: 'timestamptz' },
    lastUsedAt: { name: 'last_used_at', type: 'timestamptz' },
    revokedAt: { name: 'revoked_at', type: 'timestamptz', nullable: true },
    createdAt,
  },
});

export const CORE_ENTITIES = [
  RegionEntity,
  CountryEntity,
  SeasonEntity,
  PersonEntity,
  PlayerEntity,
  PlayerAliasEntity,
  CoachEntity,
  TeamEntity,
  RoleEntity,
  MapEntity,
  DataProviderEntity,
  HintTypeEntity,
  AppUserEntity,
  UserSessionEntity,
];
