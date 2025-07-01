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
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { UpdateWorkspaceDto } from './dtos/update-workspace.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { UserId } from '../auth/decorators/user-id.decorator';

@Controller('workspaces')
@UseGuards(JwtGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Get()
  async findAll() {
    return this.workspaceService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
  ) {
    await this.workspaceService.validateWorkspaceAccess(id, userId);
    return this.workspaceService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @UserId() userId: string,
  ) {
    await this.workspaceService.validateWorkspaceAccess(id, userId);
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
  ) {
    await this.workspaceService.validateWorkspaceAccess(id, userId);
    await this.workspaceService.remove(id);
    return { message: 'Workspace deleted successfully' };
  }
}
