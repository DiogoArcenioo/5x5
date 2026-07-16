import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class ListAdminNotificationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search = '';

  @IsOptional()
  @IsIn(['all', 'draft', 'published'])
  status: 'all' | 'draft' | 'published' = 'all';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 100;
}

export class CreateNotificationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  message!: string;

  @IsIn(['news', 'update', 'warning', 'maintenance'])
  type!: 'news' | 'update' | 'warning' | 'maintenance';

  @IsIn(['draft', 'published'])
  status!: 'draft' | 'published';

  @IsOptional()
  @IsISO8601()
  publishedAt?: string | null;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string | null;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsIn(['news', 'update', 'warning', 'maintenance'])
  type?: 'news' | 'update' | 'warning' | 'maintenance';

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @IsISO8601()
  publishedAt?: string | null;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string | null;
}

