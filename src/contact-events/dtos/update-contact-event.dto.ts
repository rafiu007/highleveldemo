import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ContactEventType } from '../contact-event.entity';

export class UpdateContactEventDto {
  @IsOptional()
  @IsEnum(ContactEventType)
  readonly eventType?: ContactEventType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly description?: string;

  @IsOptional()
  @IsDateString()
  readonly eventDate?: string;
}
