import { EntitySchema } from 'typeorm';
import { createdAt, identityInteger, updatedAt } from './entity-helpers';

export const RegionEntity = new EntitySchema({
  name: 'Region', tableName: 'regions',
  columns: {
    id: identityInteger,
    code: { type: 'varchar', length: 20, unique: true },
    name: { type: 'varchar', length: 80 },
  },
});

export const CountryEntity = new EntitySchema({
  name: 'Country', tableName: 'countries',
  columns: {
    id: identityInteger,
    code: { type: 'char', length: 2, unique: true },
    name: { type: 'varchar', length: 100 },
    regionId: { name: 'region_id', type: 'integer' },
  },
});

export const TeamEntity = new EntitySchema({
  name: 'Team', tableName: 'teams',
  columns: {
    id: identityInteger,
    name: { type: 'varchar', length: 120 },
    shortName: { name: 'short_name', type: 'varchar', length: 20, nullable: true },
    slug: { type: 'varchar', length: 140, unique: true },
    countryId: { name: 'country_id', type: 'integer', nullable: true },
    createdAt,
    updatedAt,
  },
});

export const PlayerEntity = new EntitySchema({
  name: 'Player', tableName: 'players',
  columns: {
    id: identityInteger,
    nickname: { type: 'varchar', length: 60 },
    displayName: { name: 'display_name', type: 'varchar', length: 120 },
    slug: { type: 'varchar', length: 80, unique: true },
    countryId: { name: 'country_id', type: 'integer', nullable: true },
    birthDate: { name: 'birth_date', type: 'date', nullable: true },
    careerStatus: { name: 'career_status', type: 'varchar', length: 20, default: 'active' },
    createdAt,
    updatedAt,
  },
});

export const PlayerTeamYearEntity = new EntitySchema({
  name: 'PlayerTeamYear', tableName: 'player_team_years',
  columns: {
    id: identityInteger,
    playerId: { name: 'player_id', type: 'integer' },
    teamId: { name: 'team_id', type: 'integer' },
    year: { type: 'smallint' },
    overall: { type: 'smallint' },
    firepower: { type: 'smallint' },
    entrying: { type: 'smallint' },
    trading: { type: 'smallint' },
    opening: { type: 'smallint' },
    clutching: { type: 'smallint' },
    sniping: { type: 'smallint' },
    utility: { type: 'smallint' },
    createdAt,
  },
});

export const AppUserEntity = new EntitySchema({
  name: 'AppUser', tableName: 'app_users',
  columns: {
    id: identityInteger,
    username: { type: 'varchar', length: 50 },
    usernameNormalized: { name: 'username_normalized', type: 'varchar', length: 50, unique: true },
    email: { type: 'varchar', length: 254, nullable: true },
    emailNormalized: { name: 'email_normalized', type: 'varchar', length: 254, nullable: true, unique: true },
    passwordHash: { name: 'password_hash', type: 'text', nullable: true },
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
    id: identityInteger,
    userId: { name: 'user_id', type: 'integer' },
    tokenHash: { name: 'token_hash', type: 'char', length: 64, unique: true },
    expiresAt: { name: 'expires_at', type: 'timestamptz' },
    lastUsedAt: { name: 'last_used_at', type: 'timestamptz' },
    revokedAt: { name: 'revoked_at', type: 'timestamptz', nullable: true },
    createdAt,
  },
});

export const RankedRunEntity = new EntitySchema({
  name: 'RankedRun', tableName: 'ranked_runs',
  columns: {
    id: identityInteger,
    userId: { name: 'user_id', type: 'integer' },
    playedOn: { name: 'played_on', type: 'date' },
    status: { type: 'varchar', length: 20, default: 'in_progress' },
    score: { type: 'integer', default: 0 },
    swissWins: { name: 'swiss_wins', type: 'smallint', default: 0 },
    quarterfinalWon: { name: 'quarterfinal_won', type: 'boolean', default: false },
    semifinalWon: { name: 'semifinal_won', type: 'boolean', default: false },
    finalWon: { name: 'final_won', type: 'boolean', default: false },
    createdAt,
    updatedAt,
    completedAt: { name: 'completed_at', type: 'timestamptz', nullable: true },
  },
});

export const RankedRunEventEntity = new EntitySchema({
  name: 'RankedRunEvent', tableName: 'ranked_run_events',
  columns: {
    id: identityInteger,
    runId: { name: 'run_id', type: 'integer' },
    eventKey: { name: 'event_key', type: 'varchar', length: 80 },
    eventType: { name: 'event_type', type: 'varchar', length: 30 },
    points: { type: 'smallint' },
    createdAt,
  },
});

export const CORE_ENTITIES = [
  RegionEntity,
  CountryEntity,
  TeamEntity,
  PlayerEntity,
  PlayerTeamYearEntity,
  AppUserEntity,
  UserSessionEntity,
  RankedRunEntity,
  RankedRunEventEntity,
];
