import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ContactEventType } from '../contact-event.entity';

export class CreateContactEventDto {
  @IsNotEmpty()
  @IsEnum(ContactEventType)
  readonly eventType: ContactEventType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  readonly description: string;

  @IsNotEmpty()
  @IsDateString()
  readonly eventDate: string;

  @IsNotEmpty()
  @IsUUID()
  readonly contactId: string;
}
