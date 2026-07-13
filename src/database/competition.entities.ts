import { EntitySchema } from 'typeorm';
import { uuidId } from './entity-helpers';

export const PlayerTeamMembershipEntity = new EntitySchema({
  name: 'PlayerTeamMembership', tableName: 'player_team_memberships',
  columns: {
    id: uuidId,
    playerId: { name: 'player_id', type: 'uuid' },
    teamId: { name: 'team_id', type: 'uuid' },
    startsOn: { name: 'starts_on', type: 'date' },
    endsOn: { name: 'ends_on', type: 'date', nullable: true },
    rosterStatus: { name: 'roster_status', type: 'varchar', length: 20 },
    sourceUrl: { name: 'source_url', type: 'text', nullable: true },
    notes: { type: 'text', nullable: true },
  },
});

export const CoachTeamMembershipEntity = new EntitySchema({
  name: 'CoachTeamMembership', tableName: 'coach_team_memberships',
  columns: {
    id: uuidId,
    coachId: { name: 'coach_id', type: 'uuid' },
    teamId: { name: 'team_id', type: 'uuid' },
    startsOn: { name: 'starts_on', type: 'date' },
    endsOn: { name: 'ends_on', type: 'date', nullable: true },
    roleLabel: { name: 'role_label', type: 'varchar', length: 40 },
  },
});

export const PlayerVersionEntity = new EntitySchema({
  name: 'PlayerVersion', tableName: 'player_versions',
  columns: {
    id: uuidId,
    playerId: { name: 'player_id', type: 'uuid' },
    teamId: { name: 'team_id', type: 'uuid' },
    seasonId: { name: 'season_id', type: 'uuid' },
    membershipId: { name: 'membership_id', type: 'uuid' },
    versionLabel: { name: 'version_label', type: 'varchar', length: 160 },
    referenceDate: { name: 'reference_date', type: 'date' },
    isDraftEligible: { name: 'is_draft_eligible', type: 'boolean', default: true },
    dataQuality: { name: 'data_quality', type: 'varchar', length: 20, default: 'estimated' },
    notes: { type: 'text', nullable: true },
  },
});

export const CoachVersionEntity = new EntitySchema({
  name: 'CoachVersion', tableName: 'coach_versions',
  columns: {
    id: uuidId,
    coachId: { name: 'coach_id', type: 'uuid' },
    teamId: { name: 'team_id', type: 'uuid' },
    seasonId: { name: 'season_id', type: 'uuid' },
    membershipId: { name: 'membership_id', type: 'uuid' },
    leadershipRating: { name: 'leadership_rating', type: 'smallint', nullable: true },
    tacticalRating: { name: 'tactical_rating', type: 'smallint', nullable: true },
    developmentRating: { name: 'development_rating', type: 'smallint', nullable: true },
    mentalRating: { name: 'mental_rating', type: 'smallint', nullable: true },
    formRating: { name: 'form_rating', type: 'smallint', nullable: true },
  },
});

export const PlayerVersionRoleEntity = new EntitySchema({
  name: 'PlayerVersionRole', tableName: 'player_version_roles',
  columns: {
    playerVersionId: { name: 'player_version_id', type: 'uuid', primary: true },
    roleId: { name: 'role_id', type: 'smallint', primary: true },
    proficiency: { type: 'smallint' },
    priority: { type: 'smallint', default: 1 },
    isPrimary: { name: 'is_primary', type: 'boolean', default: false },
  },
});

export const SeasonMapPoolEntity = new EntitySchema({
  name: 'SeasonMapPool', tableName: 'season_map_pool',
  columns: {
    seasonId: { name: 'season_id', type: 'uuid', primary: true },
    mapId: { name: 'map_id', type: 'smallint', primary: true },
    startsOn: { name: 'starts_on', type: 'date', nullable: true },
    endsOn: { name: 'ends_on', type: 'date', nullable: true },
  },
});

export const PlayerVersionMapRatingEntity = new EntitySchema({
  name: 'PlayerVersionMapRating', tableName: 'player_version_map_ratings',
  columns: {
    playerVersionId: { name: 'player_version_id', type: 'uuid', primary: true },
    mapId: { name: 'map_id', type: 'smallint', primary: true },
    performanceRating: { name: 'performance_rating', type: 'smallint', nullable: true },
    experienceRating: { name: 'experience_rating', type: 'smallint', nullable: true },
    sampleSizeMaps: { name: 'sample_size_maps', type: 'smallint', default: 0 },
    sourceType: { name: 'source_type', type: 'varchar', length: 20 },
    confidence: { type: 'numeric', precision: 4, scale: 3, nullable: true },
  },
});

export const LineupEntity = new EntitySchema({
  name: 'Lineup', tableName: 'lineups',
  columns: {
    id: uuidId,
    teamId: { name: 'team_id', type: 'uuid' },
    seasonId: { name: 'season_id', type: 'uuid' },
    name: { type: 'varchar', length: 140 },
    startsOn: { name: 'starts_on', type: 'date' },
    endsOn: { name: 'ends_on', type: 'date', nullable: true },
    coachVersionId: { name: 'coach_version_id', type: 'uuid', nullable: true },
    isCanonical: { name: 'is_canonical', type: 'boolean', default: true },
  },
});

export const LineupMemberEntity = new EntitySchema({
  name: 'LineupMember', tableName: 'lineup_members',
  columns: {
    lineupId: { name: 'lineup_id', type: 'uuid', primary: true },
    playerVersionId: { name: 'player_version_id', type: 'uuid', primary: true },
    defaultRoleId: { name: 'default_role_id', type: 'smallint', nullable: true },
    rosterStatus: { name: 'roster_status', type: 'varchar', length: 20 },
    joinedOn: { name: 'joined_on', type: 'date', nullable: true },
    leftOn: { name: 'left_on', type: 'date', nullable: true },
  },
});

export const TournamentEntity = new EntitySchema({
  name: 'Tournament', tableName: 'tournaments',
  columns: {
    id: uuidId,
    name: { type: 'varchar', length: 160 },
    organizer: { type: 'varchar', length: 120, nullable: true },
    tournamentType: { name: 'tournament_type', type: 'varchar', length: 30 },
    isMajorSeries: { name: 'is_major_series', type: 'boolean', default: false },
  },
});

export const TournamentEditionEntity = new EntitySchema({
  name: 'TournamentEdition', tableName: 'tournament_editions',
  columns: {
    id: uuidId,
    tournamentId: { name: 'tournament_id', type: 'uuid' },
    seasonId: { name: 'season_id', type: 'uuid' },
    name: { type: 'varchar', length: 180 },
    startsOn: { name: 'starts_on', type: 'date' },
    endsOn: { name: 'ends_on', type: 'date' },
    locationCountryCode: { name: 'location_country_code', type: 'char', length: 2, nullable: true },
    gameVersion: { name: 'game_version', type: 'varchar', length: 20 },
    isMajor: { name: 'is_major', type: 'boolean', default: false },
    formatConfig: { name: 'format_config', type: 'jsonb', nullable: true },
    tier: { type: 'varchar', length: 20, nullable: true },
  },
});

export const TournamentEntryEntity = new EntitySchema({
  name: 'TournamentEntry', tableName: 'tournament_entries',
  columns: {
    id: uuidId,
    editionId: { name: 'edition_id', type: 'uuid' },
    teamId: { name: 'team_id', type: 'uuid' },
    lineupId: { name: 'lineup_id', type: 'uuid', nullable: true },
    finalPlacement: { name: 'final_placement', type: 'smallint', nullable: true },
    stageReached: { name: 'stage_reached', type: 'varchar', length: 50, nullable: true },
    matchesWon: { name: 'matches_won', type: 'smallint', nullable: true },
    matchesLost: { name: 'matches_lost', type: 'smallint', nullable: true },
    prizeMoney: { name: 'prize_money', type: 'numeric', precision: 14, scale: 2, nullable: true },
  },
});

export const TournamentRosterMemberEntity = new EntitySchema({
  name: 'TournamentRosterMember', tableName: 'tournament_roster_members',
  columns: {
    entryId: { name: 'entry_id', type: 'uuid', primary: true },
    playerVersionId: { name: 'player_version_id', type: 'uuid', primary: true },
    registrationStatus: { name: 'registration_status', type: 'varchar', length: 20 },
    mapsPlayed: { name: 'maps_played', type: 'smallint', default: 0 },
  },
});

export const COMPETITION_ENTITIES = [
  PlayerTeamMembershipEntity,
  CoachTeamMembershipEntity,
  PlayerVersionEntity,
  CoachVersionEntity,
  PlayerVersionRoleEntity,
  SeasonMapPoolEntity,
  PlayerVersionMapRatingEntity,
  LineupEntity,
  LineupMemberEntity,
  TournamentEntity,
  TournamentEditionEntity,
  TournamentEntryEntity,
  TournamentRosterMemberEntity,
];
