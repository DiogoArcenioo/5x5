import { IsString, Length } from 'class-validator';

export class GoogleExchangeDto {
  @IsString()
  @Length(20, 200)
  code!: string;
}

