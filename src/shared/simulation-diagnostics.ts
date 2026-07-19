import { randomBytes } from 'node:crypto';
import type { RankedCampaign } from '../ranked/ranked-simulation.service';

export type SimulationDiagnosticContext = {
  campaignId?: string | number;
  action?: string;
  stage?: string;
  round?: string | number;
};

type DiagnosableError = { simulationContext?: SimulationDiagnosticContext };

export function campaignDiagnosticContext(
  campaignId: string | number,
  action: string,
  campaign?: RankedCampaign | null,
): SimulationDiagnosticContext {
  const round = campaign?.stage === 'swiss'
    ? campaign.swissRound
    : campaign?.stage === 'playoffs'
      ? campaign.playoffStage
      : undefined;
  return { campaignId, action, stage: campaign?.stage, round };
}

export function attachSimulationContext(
  error: unknown,
  context: SimulationDiagnosticContext,
): unknown {
  if (error && (typeof error === 'object' || typeof error === 'function')) {
    const target = error as DiagnosableError;
    target.simulationContext = { ...context, ...target.simulationContext };
  }
  return error;
}

export function simulationContextOf(error: unknown): SimulationDiagnosticContext | undefined {
  return error && typeof error === 'object'
    ? (error as DiagnosableError).simulationContext
    : undefined;
}

export function createDiagnosticCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}
