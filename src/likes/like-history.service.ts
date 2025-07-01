import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeHistory } from './like-history.entity';
import {
  LikeActionType,
  QualityWithMetadata,
} from '../interfaces/qualities.enum';

@Injectable()
export class LikeHistoryService {
  constructor(
    @InjectRepository(LikeHistory)
    private likeHistoryRepository: Repository<LikeHistory>,
  ) {}

  async recordLikeAction(
    fromUserPhoneNumber: string,
    toUserPhoneNumber: string,
    action: LikeActionType,
    qualities?: QualityWithMetadata[],
  ): Promise<LikeHistory> {
    const likeHistory = this.likeHistoryRepository.create({
      fromPhoneNumber: fromUserPhoneNumber,
      toPhoneNumber: toUserPhoneNumber,
      action,
      qualities,
    });

    return await this.likeHistoryRepository.save(likeHistory);
  }

  // TODO: Paginate later
  async getSentHistory(phoneNumber: string) {
    return await this.likeHistoryRepository.find({
      where: { fromPhoneNumber: phoneNumber, action: LikeActionType.LIKE },
      order: { createdAt: 'DESC' },
    });
  }

  // TODO: Paginate later
  async getReceivedHistory(phoneNumber: string) {
    return await this.likeHistoryRepository.find({
      where: { toPhoneNumber: phoneNumber, action: LikeActionType.LIKE },
      order: { createdAt: 'DESC' },
    });
  }

  async getLikeHistoryBetweenUsers(
    userOnePhoneNumber: string,
    userTwoPhoneNumber: string,
  ) {
    return await this.likeHistoryRepository.find({
      where: [
        {
          fromPhoneNumber: userOnePhoneNumber,
          toPhoneNumber: userTwoPhoneNumber,
        },
        {
          fromPhoneNumber: userTwoPhoneNumber,
          toPhoneNumber: userOnePhoneNumber,
        },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getMostRecentAction(fromPhoneNumber: string, toPhoneNumber: string) {
    return await this.likeHistoryRepository.findOne({
      where: { fromPhoneNumber, toPhoneNumber },
      order: { createdAt: 'DESC' },
    });
  }
}
