import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsString, Max, Min } from 'class-validator';

const ROLES = ['entry', 'awper', 'support', 'rifler', 'lurker', 'trader'];

export class RankedRevisionDto {
  @IsInt() @Min(0)
  revision!: number;
}

export class RankedStrategyDto extends RankedRevisionDto {
  @IsArray() @ArrayMinSize(5) @ArrayMaxSize(5)
  @IsIn(ROLES, { each: true })
  roles!: string[];
}

export class RankedDraftPickDto extends RankedRevisionDto {
  @IsString()
  slug!: string;

  @IsInt() @Min(0) @Max(4)
  slot!: number;
}

export class RankedDraftLayoutDto extends RankedStrategyDto {
  @IsArray() @ArrayMinSize(5) @ArrayMaxSize(5)
  slugs!: Array<string|null>;
}

export class RankedAdvanceDto extends RankedRevisionDto {}
