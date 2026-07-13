import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(3, 50)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class RegisterDto extends LoginDto {
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'username aceita apenas letras, números, ponto, hífen e underscore.',
  })
  declare username: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;
}
