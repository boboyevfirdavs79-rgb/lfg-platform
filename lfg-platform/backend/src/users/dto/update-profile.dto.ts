import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  telegramUsername?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;
}
