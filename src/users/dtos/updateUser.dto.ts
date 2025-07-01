import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly profilePicture?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;

  @IsOptional()
  @IsUUID()
  readonly workspaceId?: string;
}
