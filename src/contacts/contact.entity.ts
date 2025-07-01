import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Workspace } from '../workspace/workspace.entity';
import { ContactEvent } from '../contact-events/contact-event.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  lastContactedAt: Date;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @OneToMany(() => ContactEvent, (event) => event.contact)
  events: ContactEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
