import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEventService } from './contact-event.service';
import { ContactEventController } from './contact-event.controller';
import { ContactEvent } from './contact-event.entity';
import { ContactModule } from '../contacts/contact.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactEvent]),
    forwardRef(() => ContactModule),
    GuardsModule,
  ],
  controllers: [ContactEventController],
  providers: [ContactEventService],
  exports: [ContactEventService],
})
export class ContactEventModule {}
