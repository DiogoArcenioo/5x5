import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

export class ListAdminUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search = '';

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

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_.-]+$/)
  username?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== null && value !== '')
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';

  @IsOptional()
  @IsIn(['active', 'disabled'])
  status?: 'active' | 'disabled';
}

export class ResetAdminUserPasswordDto {
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  password!: string;
}
