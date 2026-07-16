import { IsIn, IsString, Length } from 'class-validator';

export const RANKED_EVENT_TYPES = [
  'swiss_win',
  'quarterfinal_win',
  'semifinal_win',
  'final_win',
] as const;

export type RankedEventType = typeof RANKED_EVENT_TYPES[number];

export class RankedEventDto {
  @IsIn(RANKED_EVENT_TYPES)
  eventType!: RankedEventType;

  @IsString()
  @Length(3, 80)
  eventKey!: string;
}

