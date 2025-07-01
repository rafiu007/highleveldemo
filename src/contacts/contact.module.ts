import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { Contact } from './contact.entity';
import { WorkspaceModule } from '../workspace/workspace.module';
import { ContactEventModule } from '../contact-events/contact-event.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    WorkspaceModule,
    forwardRef(() => ContactEventModule),
    GuardsModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
