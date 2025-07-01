import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactEvent } from './contact-event.entity';
import { CreateContactEventDto } from './dtos/create-contact-event.dto';
import { UpdateContactEventDto } from './dtos/update-contact-event.dto';
import { ContactService } from '../contacts/contact.service';

@Injectable()
export class ContactEventService {
  constructor(
    @InjectRepository(ContactEvent)
    private readonly contactEventRepository: Repository<ContactEvent>,
    private readonly contactService: ContactService,
  ) {}

  async create(
    createContactEventDto: CreateContactEventDto,
    userId: string,
  ): Promise<ContactEvent> {
    // Validate contact access (this will also validate workspace access)
    const contact = await this.contactService.findById(
      createContactEventDto.contactId,
      userId,
    );

    const contactEvent = this.contactEventRepository.create({
      ...createContactEventDto,
      eventDate: new Date(createContactEventDto.eventDate),
      workspaceId: contact.workspaceId,
      createdBy: userId,
    });

    return this.contactEventRepository.save(contactEvent);
  }

  async findAllByContact(
    contactId: string,
    userId: string,
  ): Promise<readonly ContactEvent[]> {
    // Validate contact access
    await this.contactService.findById(contactId, userId);

    return this.contactEventRepository.find({
      where: { contactId },
      order: { eventDate: 'DESC' },
    });
  }

  async findAllByWorkspace(
    workspaceId: string,
  ): Promise<readonly ContactEvent[]> {
    // This will be called from contact service which already validates workspace access
    return this.contactEventRepository.find({
      where: { workspaceId },
      order: { eventDate: 'DESC' },
      relations: ['contact'],
    });
  }

  async findById(id: string, userId: string): Promise<ContactEvent> {
    const contactEvent = await this.contactEventRepository.findOne({
      where: { id },
      relations: ['contact'],
    });

    if (!contactEvent) {
      throw new NotFoundException('Contact event not found');
    }

    // Validate contact access (this will also validate workspace access)
    await this.contactService.findById(contactEvent.contactId, userId);

    return contactEvent;
  }

  async update(
    id: string,
    updateContactEventDto: UpdateContactEventDto,
    userId: string,
  ): Promise<ContactEvent> {
    const contactEvent = await this.findById(id, userId);

    const updatedContactEvent = {
      ...contactEvent,
      ...updateContactEventDto,
      eventDate: updateContactEventDto.eventDate
        ? new Date(updateContactEventDto.eventDate)
        : contactEvent.eventDate,
    };

    await this.contactEventRepository.save(updatedContactEvent);
    return this.findById(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const contactEvent = await this.findById(id, userId);
    await this.contactEventRepository.remove(contactEvent);
  }
}
