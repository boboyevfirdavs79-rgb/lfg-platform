import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;

  @IsString()
  game: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  rankLevel?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  playersNeeded?: number;
}
