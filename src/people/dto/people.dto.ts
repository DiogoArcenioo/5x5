import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CAREER_STATUSES = ['active', 'inactive', 'retired'] as const;

export class AliasInputDto {
  @ApiProperty({ example: 'FalleN' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  alias!: string;

  @ApiProperty({ enum: ['nickname', 'real_name', 'former_nick'] })
  @IsIn(['nickname', 'real_name', 'former_nick'])
  aliasType!: string;
}

export class CreatePlayerDto {
  @ApiProperty({ example: 'Gabriel Toledo' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  legalName?: string;

  @ApiPropertyOptional({ example: '1991-05-30' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'BR' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  nationalityCode?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  secondaryNationalityCode?: string;

  @ApiProperty({ example: 'FalleN' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  nickname!: string;

  @ApiProperty({ example: 'fallen' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(80)
  slug!: string;

  @ApiPropertyOptional({ example: '2005-01-01' })
  @IsOptional()
  @IsDateString()
  debutDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  retirementDate?: string;

  @ApiProperty({ enum: CAREER_STATUSES, example: 'active' })
  @IsIn(CAREER_STATUSES)
  careerStatus!: string;

  @ApiPropertyOptional({ type: [AliasInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AliasInputDto)
  aliases?: AliasInputDto[];
}

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {}

export class CreateCoachDto {
  @ApiProperty({ example: 'Wilton Prado' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  legalName?: string;

  @ApiPropertyOptional({ example: '1985-07-13' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'BR' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  nationalityCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  secondaryNationalityCode?: string;

  @ApiPropertyOptional({ example: '2016-01-01' })
  @IsOptional()
  @IsDateString()
  coachSince?: string;

  @ApiProperty({ enum: CAREER_STATUSES, example: 'active' })
  @IsIn(CAREER_STATUSES)
  careerStatus!: string;
}

export class UpdateCoachDto extends PartialType(CreateCoachDto) {}

export class PeopleListDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 25, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 25;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CAREER_STATUSES })
  @IsOptional()
  @IsIn(CAREER_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: 'BR' })
  @IsOptional()
  @Transform(({ value }) => String(value).toUpperCase())
  @IsString()
  @Length(2, 2)
  nationalityCode?: string;
}
