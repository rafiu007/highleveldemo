import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ContactEventService } from './contact-event.service';
import { CreateContactEventDto } from './dtos/create-contact-event.dto';
import { UpdateContactEventDto } from './dtos/update-contact-event.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { UserId } from '../auth/decorators/user-id.decorator';

@Controller('contact-events')
@UseGuards(JwtGuard)
export class ContactEventController {
  constructor(private readonly contactEventService: ContactEventService) {}

  @Post()
  async create(
    @Body() createContactEventDto: CreateContactEventDto,
    @UserId() userId: string,
  ) {
    return this.contactEventService.create(createContactEventDto, userId);
  }

  @Get('contact/:contactId')
  async findAllByContact(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @UserId() userId: string,
  ) {
    return this.contactEventService.findAllByContact(contactId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
  ) {
    return this.contactEventService.findById(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactEventDto: UpdateContactEventDto,
    @UserId() userId: string,
  ) {
    return this.contactEventService.update(id, updateContactEventDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
  ) {
    await this.contactEventService.remove(id, userId);
    return { message: 'Contact event deleted successfully' };
  }
}
