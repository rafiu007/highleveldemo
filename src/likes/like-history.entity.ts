import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import {
  LikeActionType,
  QualityWithMetadata,
} from '../interfaces/qualities.enum';

@Entity()
export class LikeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  fromPhoneNumber: string;

  @Column()
  @Index()
  toPhoneNumber: string;

  @Column('text')
  action: LikeActionType;

  @Column('simple-array', { nullable: true })
  qualities?: QualityWithMetadata[];

  @CreateDateColumn()
  createdAt: Date;
}
