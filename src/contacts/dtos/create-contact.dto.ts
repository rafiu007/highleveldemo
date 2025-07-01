import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly name: string;

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

  @IsNotEmpty()
  @IsUUID()
  readonly workspaceId: string;
}
