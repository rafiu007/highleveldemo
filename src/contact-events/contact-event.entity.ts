import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contact } from '../contacts/contact.entity';
import { Workspace } from '../workspace/workspace.entity';

export enum ContactEventType {
  // User-initiated events
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  NOTE = 'note',
  SMS = 'sms',
  OTHER = 'other',

  // System-generated events for contact history
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

@Entity('contact_events')
export class ContactEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContactEventType,
    default: ContactEventType.NOTE,
  })
  eventType: ContactEventType;

  @Column({ type: 'text' })
  description: string;

  @Column()
  eventDate: Date;

  @Column()
  contactId: string;

  @Column()
  workspaceId: string;

  @Column()
  createdBy: string; // User ID who created the event

  @Column({ type: 'boolean', default: false })
  isSystemGenerated: boolean; // Flag to identify system vs user events

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Store additional data like field changes

  @ManyToOne(() => Contact, (contact) => contact.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contactId' })
  contact: Contact;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
