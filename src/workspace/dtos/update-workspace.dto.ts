import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
