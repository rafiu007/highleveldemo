import { IsString, IsNotEmpty, IsArray, IsBoolean } from 'class-validator';
import { QualityWithMetadata } from '../../interfaces/qualities.enum';
export class CreateLikeDto {
  @IsString()
  @IsNotEmpty()
  fromPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  toPhoneNumber: string;

  @IsArray()
  @IsNotEmpty()
  qualities: QualityWithMetadata[];

  @IsBoolean()
  @IsNotEmpty()
  isEndorsed: boolean;

  @IsBoolean()
  @IsNotEmpty()
  usedSearch: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isMotherQuality: boolean;
}
