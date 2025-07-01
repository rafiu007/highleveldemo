import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { Workspace } from './workspace.entity';
import { Contact } from '../contacts/contact.entity';
import { ContactEvent } from '../contact-events/contact-event.entity';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, Contact, ContactEvent]),
    GuardsModule,
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
