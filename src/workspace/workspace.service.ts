import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { UpdateWorkspaceDto } from './dtos/update-workspace.dto';
import { Contact } from '../contacts/contact.entity';
import { ContactEvent } from '../contact-events/contact-event.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactEvent)
    private readonly contactEventRepository: Repository<ContactEvent>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      isActive: true,
    });

    return this.workspaceRepository.save(workspace);
  }

  async findAll(): Promise<readonly Workspace[]> {
    return this.workspaceRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id, isActive: true },
      relations: ['users'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const workspace = await this.findById(id);

    const updatedWorkspace = {
      ...workspace,
      ...updateWorkspaceDto,
    };

    await this.workspaceRepository.save(updatedWorkspace);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const workspace = await this.findById(id);

    // Soft delete by marking as inactive
    workspace.isActive = false;
    await this.workspaceRepository.save(workspace);
  }

  async validateWorkspaceAccess(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['users'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const hasAccess = workspace.users.some((user) => user.id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this workspace');
    }

    return true;
  }

  async getDashboardData(workspaceId: string) {
    const [totalContacts, totalEvents, recentContacts, recentEvents] =
      await Promise.all([
        this.contactRepository.count({ where: { workspaceId } }),
        this.contactEventRepository.count({ where: { workspaceId } }),
        this.contactRepository.find({
          where: { workspaceId },
          order: { createdAt: 'DESC' },
          take: 5,
        }),
        this.contactEventRepository.find({
          where: { workspaceId },
          order: { createdAt: 'DESC' },
          take: 10,
          relations: ['contact'],
        }),
      ]);

    return {
      totalContacts,
      totalEvents,
      recentContacts,
      recentEvents,
    };
  }
}
