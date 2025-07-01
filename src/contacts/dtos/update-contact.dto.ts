import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  readonly phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly notes?: string;

  @IsOptional()
  @IsDateString()
  readonly lastContactedAt?: string;
}
