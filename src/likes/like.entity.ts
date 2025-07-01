import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { QualityWithMetadata } from '../interfaces/qualities.enum';

import { DbAwareColumn } from '../decorators/db-aware-column.decorator';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  fromPhoneNumber: string;

  @Column()
  @Index()
  toPhoneNumber: string;

  @Column({ default: false })
  isEndorsed: boolean;

  @DbAwareColumn({ nullable: true })
  qualities: QualityWithMetadata[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isNotified: boolean;

  @Column({ default: false })
  usedSearch: boolean;

  @Column({ default: false })
  isMotherQuality: boolean;
}
