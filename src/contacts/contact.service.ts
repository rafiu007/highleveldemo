import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UpdateContactDto } from './dtos/update-contact.dto';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly workspaceService: WorkspaceService,
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

    return this.contactRepository.save(contact);
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

    const updatedContact = {
      ...contact,
      ...updateContactDto,
      lastContactedAt: updateContactDto.lastContactedAt
        ? new Date(updateContactDto.lastContactedAt)
        : contact.lastContactedAt,
    };

    await this.contactRepository.save(updatedContact);
    return this.findById(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const contact = await this.findById(id, userId);
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
