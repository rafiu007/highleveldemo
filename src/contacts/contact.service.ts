import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UpdateContactDto } from './dtos/update-contact.dto';
import { WorkspaceService } from '../workspace/workspace.service';
import { ContactEventService } from '../contact-events/contact-event.service';
import { ContactEventType } from '../contact-events/contact-event.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly workspaceService: WorkspaceService,
    @Inject(forwardRef(() => ContactEventService))
    private readonly contactEventService: ContactEventService,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    userId: string,
  ): Promise<Contact> {
    // Validate workspace access
    await this.workspaceService.validateWorkspaceAccess(
      createContactDto.workspaceId,
      userId,
    );

    const contact = this.contactRepository.create({
      ...createContactDto,
    });

    const savedContact = await this.contactRepository.save(contact);

    // Create system event for contact creation
    await this.contactEventService.createSystemEvent(
      savedContact.id,
      savedContact.workspaceId,
      ContactEventType.CREATED,
      `Contact "${savedContact.name}" was created`,
      userId,
      {
        contactData: {
          name: savedContact.name,
          email: savedContact.email,
          phone: savedContact.phone,
          address: savedContact.address,
        },
      },
    );

    return savedContact;
  }

  async findAllByWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<readonly Contact[]> {
    // Validate workspace access
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    return this.contactRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
      relations: ['events'],
    });
  }

  async findById(id: string, userId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['workspace', 'events'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Validate workspace access
    await this.workspaceService.validateWorkspaceAccess(
      contact.workspaceId,
      userId,
    );

    return contact;
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    userId: string,
  ): Promise<Contact> {
    const contact = await this.findById(id, userId);

    // Track what fields are being changed
    const changes: Record<string, { from: any; to: any }> = {};
    const fieldsToTrack = ['name', 'email', 'phone', 'address', 'notes'];

    fieldsToTrack.forEach((field) => {
      if (
        updateContactDto[field] !== undefined &&
        updateContactDto[field] !== contact[field]
      ) {
        changes[field] = {
          from: contact[field],
          to: updateContactDto[field],
        };
      }
    });

    // Handle lastContactedAt separately
    if (updateContactDto.lastContactedAt) {
      const newDate = new Date(updateContactDto.lastContactedAt);
      if (newDate.getTime() !== contact.lastContactedAt?.getTime()) {
        changes.lastContactedAt = {
          from: contact.lastContactedAt,
          to: newDate,
        };
      }
    }

    const updatedContact = {
      ...contact,
      ...updateContactDto,
      lastContactedAt: updateContactDto.lastContactedAt
        ? new Date(updateContactDto.lastContactedAt)
        : contact.lastContactedAt,
    };

    await this.contactRepository.save(updatedContact);

    // Create system event for contact update if there were changes
    if (Object.keys(changes).length > 0) {
      const changedFields = Object.keys(changes).join(', ');
      await this.contactEventService.createSystemEvent(
        contact.id,
        contact.workspaceId,
        ContactEventType.UPDATED,
        `Contact "${contact.name}" was updated. Changed fields: ${changedFields}`,
        userId,
        {
          changes,
          updatedFields: Object.keys(changes),
        },
      );
    }

    return this.findById(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const contact = await this.findById(id, userId);

    // Create system event for contact deletion before removing
    await this.contactEventService.createSystemEvent(
      contact.id,
      contact.workspaceId,
      ContactEventType.DELETED,
      `Contact "${contact.name}" was deleted`,
      userId,
      {
        deletedContactData: {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          notes: contact.notes,
          lastContactedAt: contact.lastContactedAt,
        },
      },
    );

    await this.contactRepository.remove(contact);
  }

  async searchContacts(
    workspaceId: string,
    searchTerm: string,
    userId: string,
  ): Promise<readonly Contact[]> {
    // Validate workspace access
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    return this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.workspaceId = :workspaceId', { workspaceId })
      .andWhere(
        '(contact.name ILIKE :searchTerm OR contact.email ILIKE :searchTerm OR contact.phone ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('contact.createdAt', 'DESC')
      .getMany();
  }
}
