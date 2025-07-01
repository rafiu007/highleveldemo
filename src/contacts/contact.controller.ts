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
  Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UpdateContactDto } from './dtos/update-contact.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { UserId } from '../auth/decorators/user-id.decorator';

@Controller('contacts')
@UseGuards(JwtGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(
    @Body() createContactDto: CreateContactDto,
    @UserId() userId: string,
  ) {
    return this.contactService.create(createContactDto, userId);
  }

  @Get('workspace/:workspaceId')
  async findAllByWorkspace(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @UserId() userId: string,
  ) {
    return this.contactService.findAllByWorkspace(workspaceId, userId);
  }

  @Get('workspace/:workspaceId/search')
  async searchContacts(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query('q') searchTerm: string,
    @UserId() userId: string,
  ) {
    return this.contactService.searchContacts(workspaceId, searchTerm, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
  ) {
    return this.contactService.findById(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
    @UserId() userId: string,
  ) {
    return this.contactService.update(id, updateContactDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
  ) {
    await this.contactService.remove(id, userId);
    return { message: 'Contact deleted successfully' };
  }
}
