import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CAREER_STATUSES = ['active', 'inactive', 'retired'] as const;

export class CreatePlayerDto {
  @ApiProperty({ example: 'FalleN' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  nickname!: string;

  @ApiProperty({ example: 'Gabriel Toledo' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({ example: 'fallen' })
  @IsString()
  @Matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/)
  @MaxLength(80)
  slug!: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  countryId?: number;

  @ApiPropertyOptional({ example: '1991-05-30' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ enum: CAREER_STATUSES, example: 'active' })
  @IsIn(CAREER_STATUSES)
  careerStatus!: string;

}

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {}

export class PeopleListDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  pageSize = 25;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsIn(CAREER_STATUSES)
  status?: string;

  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  countryId?: number;
}
