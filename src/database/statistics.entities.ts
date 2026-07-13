import { EntitySchema } from 'typeorm';
import { uuidId } from './entity-helpers';

export const PlayerExternalReferenceEntity = new EntitySchema({
  name: 'PlayerExternalReference', tableName: 'player_external_references',
  columns: {
    id: uuidId,
    playerId: { name: 'player_id', type: 'uuid' },
    providerId: { name: 'provider_id', type: 'smallint' },
    externalPlayerId: { name: 'external_player_id', type: 'varchar', length: 100 },
    profileUrl: { name: 'profile_url', type: 'text', nullable: true },
    verifiedAt: { name: 'verified_at', type: 'timestamptz', nullable: true },
  },
});

export const PlayerPerformancePeriodEntity = new EntitySchema({
  name: 'PlayerPerformancePeriod', tableName: 'player_performance_periods',
  columns: {
    id: uuidId,
    playerId: { name: 'player_id', type: 'uuid' },
    providerId: { name: 'provider_id', type: 'smallint' },
    seasonId: { name: 'season_id', type: 'uuid', nullable: true },
    playerVersionId: { name: 'player_version_id', type: 'uuid', nullable: true },
    periodType: { name: 'period_type', type: 'varchar', length: 30 },
    startsOn: { name: 'starts_on', type: 'date' },
    endsOn: { name: 'ends_on', type: 'date' },
    isPartial: { name: 'is_partial', type: 'boolean' },
    gameVersion: { name: 'game_version', type: 'varchar', length: 20 },
    teamScope: { name: 'team_scope', type: 'varchar', length: 20 },
    teamId: { name: 'team_id', type: 'uuid', nullable: true },
    mapsPlayed: { name: 'maps_played', type: 'integer' },
    roundsPlayed: { name: 'rounds_played', type: 'integer', nullable: true },
    ratingSystem: { name: 'rating_system', type: 'varchar', length: 30, nullable: true },
    sourceUrl: { name: 'source_url', type: 'text', nullable: true },
    sourceFilters: { name: 'source_filters', type: 'jsonb', default: {} },
    capturedAt: { name: 'captured_at', type: 'timestamptz', createDate: true },
    sourcePayloadHash: { name: 'source_payload_hash', type: 'varchar', length: 64, nullable: true },
    supersedesPeriodId: { name: 'supersedes_period_id', type: 'uuid', nullable: true },
    dataQuality: { name: 'data_quality', type: 'varchar', length: 20, default: 'partial' },
  },
});

export const PlayerSourceAttributeScoreEntity = new EntitySchema({
  name: 'PlayerSourceAttributeScore', tableName: 'player_source_attribute_scores',
  columns: {
    performancePeriodId: { name: 'performance_period_id', type: 'uuid', primary: true },
    rating: { type: 'numeric', precision: 5, scale: 3, nullable: true },
    firepower: { type: 'smallint', nullable: true },
    entrying: { type: 'smallint', nullable: true },
    trading: { type: 'smallint', nullable: true },
    opening: { type: 'smallint', nullable: true },
    clutching: { type: 'smallint', nullable: true },
    sniping: { type: 'smallint', nullable: true },
    utility: { type: 'smallint', nullable: true },
    metricSetVersion: { name: 'metric_set_version', type: 'varchar', length: 30 },
    sourceCalculated: { name: 'source_calculated', type: 'boolean', default: true },
  },
});

export const PerformanceMetricDefinitionEntity = new EntitySchema({
  name: 'PerformanceMetricDefinition', tableName: 'performance_metric_definitions',
  columns: {
    id: uuidId,
    providerId: { name: 'provider_id', type: 'smallint' },
    code: { type: 'varchar', length: 60 },
    displayName: { name: 'display_name', type: 'varchar', length: 100 },
    metricFamily: { name: 'metric_family', type: 'varchar', length: 40 },
    unit: { type: 'varchar', length: 20 },
    minimumValue: { name: 'minimum_value', type: 'numeric', precision: 12, scale: 4, nullable: true },
    maximumValue: { name: 'maximum_value', type: 'numeric', precision: 12, scale: 4, nullable: true },
    introducedOn: { name: 'introduced_on', type: 'date', nullable: true },
    retiredOn: { name: 'retired_on', type: 'date', nullable: true },
    description: { type: 'text', nullable: true },
  },
});

export const PlayerPerformanceMetricValueEntity = new EntitySchema({
  name: 'PlayerPerformanceMetricValue', tableName: 'player_performance_metric_values',
  columns: {
    performancePeriodId: { name: 'performance_period_id', type: 'uuid', primary: true },
    metricDefinitionId: { name: 'metric_definition_id', type: 'uuid', primary: true },
    numericValue: { name: 'numeric_value', type: 'numeric', precision: 14, scale: 5, nullable: true },
    textValue: { name: 'text_value', type: 'varchar', length: 100, nullable: true },
    percentile: { type: 'numeric', precision: 5, scale: 2, nullable: true },
    sampleSize: { name: 'sample_size', type: 'integer', nullable: true },
    rawDisplayValue: { name: 'raw_display_value', type: 'varchar', length: 50, nullable: true },
  },
});

export const PlayerVersionGameRatingEntity = new EntitySchema({
  name: 'PlayerVersionGameRating', tableName: 'player_version_game_ratings',
  columns: {
    playerVersionId: { name: 'player_version_id', type: 'uuid', primary: true },
    gameOverall: { name: 'game_overall', type: 'smallint', nullable: true },
    aim: { type: 'smallint', nullable: true },
    impact: { type: 'smallint', nullable: true },
    consistency: { type: 'smallint', nullable: true },
    clutch: { type: 'smallint', nullable: true },
    experience: { type: 'smallint', nullable: true },
    leadership: { type: 'smallint', nullable: true },
    awp: { type: 'smallint', nullable: true },
    entry: { type: 'smallint', nullable: true },
    support: { type: 'smallint', nullable: true },
    seasonForm: { name: 'season_form', type: 'smallint', nullable: true },
    sourcePeriodId: { name: 'source_period_id', type: 'uuid', nullable: true },
    ratingModelVersion: { name: 'rating_model_version', type: 'varchar', length: 30 },
    calculationMethod: { name: 'calculation_method', type: 'varchar', length: 20 },
    calculatedAt: { name: 'calculated_at', type: 'timestamptz', createDate: true },
    manualAdjustment: { name: 'manual_adjustment', type: 'smallint', default: 0 },
    adjustmentReason: { name: 'adjustment_reason', type: 'text', nullable: true },
  },
});

export const STATISTICS_ENTITIES = [
  PlayerExternalReferenceEntity,
  PlayerPerformancePeriodEntity,
  PlayerSourceAttributeScoreEntity,
  PerformanceMetricDefinitionEntity,
  PlayerPerformanceMetricValueEntity,
  PlayerVersionGameRatingEntity,
];
