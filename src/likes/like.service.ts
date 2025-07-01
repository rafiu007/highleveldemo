import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, In } from 'typeorm';
import { Like } from './like.entity';
import { User } from '../users/user.entity';
import { CreateLikeDto } from './dto/createLike.dto';
import { LikeHistoryService } from './like-history.service';
import {
  LikeActionType,
  QualityWithMetadata,
} from '../interfaces/qualities.enum';
import {
  DefaultQuality,
  SubQuality,
  QualityCategory,
} from '../interfaces/qualities.enum';

const MONTHLY_LIKE_LIMIT = 3;
const NEW_USER_LIKE_LIMIT = 10;
const NEW_USER_HOURS_THRESHOLD = 24;

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly likeHistoryService: LikeHistoryService,
    private dataSource: DataSource,
  ) {}

  private async isWithinFirst24Hours(phoneNumber: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const now = new Date();
    const userCreatedAt = new Date(user.createdAt);
    const hoursDifference =
      (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
    return hoursDifference <= NEW_USER_HOURS_THRESHOLD;
  }

  async createLike(data: CreateLikeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromUser = await this.userRepository.findOne({
        where: { phoneNumber: data.fromPhoneNumber },
      });

      if (!fromUser) {
        throw new BadRequestException('From user not found');
      }

      const toUser = await this.userRepository.findOne({
        where: { phoneNumber: data.toPhoneNumber },
      });

      if (!toUser) {
        const newUser = this.userRepository.create({
          phoneNumber: data.toPhoneNumber,
          isActive: true,
        });
        await queryRunner.manager.save(newUser);
      }

      const likesCount = await this.getLikesInCurrentPeriod(
        data.fromPhoneNumber,
        fromUser,
      );
      const isNew = await this.isWithinFirst24Hours(data.fromPhoneNumber);
      const maxLikes = isNew ? NEW_USER_LIKE_LIMIT : MONTHLY_LIKE_LIMIT;

      if (likesCount >= maxLikes) {
        throw new BadRequestException('Monthly like limit reached');
      }

      const like = this.likeRepository.create({
        fromPhoneNumber: data.fromPhoneNumber,
        toPhoneNumber: data.toPhoneNumber,
        isNotified: false,
        isEndorsed: data.isEndorsed,
        qualities: data.qualities,
        usedSearch: data.usedSearch,
        isMotherQuality: data.isMotherQuality,
      });

      await queryRunner.manager.save(like);

      if (fromUser) {
        await this.likeHistoryService.recordLikeAction(
          fromUser.phoneNumber,
          data.toPhoneNumber,
          LikeActionType.LIKE,
          data.qualities,
        );
      }

      await queryRunner.commitTransaction();

      return { like };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getLikes(phoneNumber: string) {
    return this.likeRepository.find({
      where: { toPhoneNumber: phoneNumber },
    });
  }

  async unlike(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const like = await this.likeRepository.findOne({
        where: { id },
      });

      if (!like) {
        throw new BadRequestException('Like not found');
      }

      await queryRunner.manager.delete(Like, like.id);
      await this.likeHistoryService.recordLikeAction(
        like.fromPhoneNumber,
        like.toPhoneNumber,
        LikeActionType.UNLIKE,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async unlikeV2(fromPhoneNumber: string, toPhoneNumber: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const like = await this.likeRepository.findOne({
        where: { fromPhoneNumber, toPhoneNumber },
      });

      if (!like) {
        throw new BadRequestException('Like not found');
      }

      await queryRunner.manager.delete(Like, like.id);
      await this.likeHistoryService.recordLikeAction(
        like.fromPhoneNumber,
        like.toPhoneNumber,
        LikeActionType.UNLIKE,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async unEndorse(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const like = await this.likeRepository.findOne({
        where: { id },
      });

      if (!like) {
        throw new BadRequestException('Like not found');
      }

      await queryRunner.manager.update(Like, id, { isEndorsed: false });
      await this.likeHistoryService.recordLikeAction(
        like.fromPhoneNumber,
        like.toPhoneNumber,
        LikeActionType.UNENDORSE,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async unEndorseV2(fromPhoneNumber: string, toPhoneNumber: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const like = await this.likeRepository.findOne({
        where: { fromPhoneNumber, toPhoneNumber },
      });

      if (!like) {
        throw new BadRequestException('Like not found');
      }

      await queryRunner.manager.update(
        Like,
        {
          fromPhoneNumber,
          toPhoneNumber,
        },
        { isEndorsed: false },
      );
      await this.likeHistoryService.recordLikeAction(
        like.fromPhoneNumber,
        like.toPhoneNumber,
        LikeActionType.UNENDORSE,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async endorseV2(fromPhoneNumber: string, toPhoneNumber: string) {
    const like = await this.likeRepository.findOne({
      where: { fromPhoneNumber, toPhoneNumber },
    });

    if (!like) {
      throw new BadRequestException('Like not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.manager.update(
        Like,
        { fromPhoneNumber, toPhoneNumber },
        { isEndorsed: true },
      );
      await this.likeHistoryService.recordLikeAction(
        like.fromPhoneNumber,
        like.toPhoneNumber,
        LikeActionType.ENDORSE,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async endorse(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const like = await this.likeRepository.findOne({
        where: { id },
      });

      if (!like) {
        throw new BadRequestException('Like not found');
      }

      await queryRunner.manager.update(Like, id, { isEndorsed: true });
      await this.likeHistoryService.recordLikeAction(
        like.fromPhoneNumber,
        like.toPhoneNumber,
        LikeActionType.ENDORSE,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTopThreeQualities(user: User) {
    const likes = await this.likeRepository.find({
      where: { toPhoneNumber: user.phoneNumber },
    });

    const qualities = likes.map((like) => like.qualities);
    const qualityFrequency: Record<string, number> = qualities.reduce(
      (acc, quality) => {
        quality.forEach((q) => {
          const key = `${q.value}|${q.category}|${q.isDefault}|${q.isGrammarCorrected}`;
          acc[key] = (acc[key] || 0) + 1;
        });
        return acc;
      },
      {},
    );

    return Object.entries(qualityFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => {
        const [value, category, isDefault, isGrammarCorrected] = key.split('|');
        return {
          value: value as DefaultQuality | SubQuality,
          category: category as QualityCategory,
          isDefault: isDefault === 'true',
          isGrammarCorrected: isGrammarCorrected === 'true',
        };
      });
  }

  async getTopThreeQualitiesPerUser(
    users: User[],
  ): Promise<Record<string, QualityWithMetadata[]>> {
    // Fetch all likes for all users in one query
    const phoneNumbers = users.map((user) => user.phoneNumber);
    const allLikes = await this.likeRepository.find({
      where: { toPhoneNumber: In(phoneNumbers) },
    });

    // Group likes by phone number
    const likesByPhone = allLikes.reduce(
      (acc, like) => {
        acc[like.toPhoneNumber] = acc[like.toPhoneNumber] || [];
        acc[like.toPhoneNumber].push(like);
        return acc;
      },
      {} as Record<string, Like[]>,
    );

    // Calculate qualities for each user
    return phoneNumbers.reduce((acc, phoneNumber) => {
      const userLikes = likesByPhone[phoneNumber] || [];
      const qualities = userLikes.flatMap((like) => like.qualities);

      const qualityFrequency: Record<string, number> = qualities.reduce(
        (freq, q) => {
          const key = `${q.value}|${q.category}|${q.isDefault}|${q.isGrammarCorrected}`;
          freq[key] = (freq[key] || 0) + 1;
          return freq;
        },
        {},
      );

      acc[phoneNumber] = Object.entries(qualityFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([key]) => {
          const [value, category, isDefault, isGrammarCorrected] =
            key.split('|');
          return {
            value: value as DefaultQuality | SubQuality,
            category: category as QualityCategory,
            isDefault: isDefault === 'true',
            isGrammarCorrected: isGrammarCorrected === 'true',
          };
        });

      return acc;
    }, {});
  }

  private async getLikesInCurrentPeriod(
    phoneNumber: string,
    user: User,
  ): Promise<number> {
    const now = new Date();
    const daysSinceCreation = Math.floor(
      (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const currentPeriodNumber = Math.floor(daysSinceCreation / 30);

    // Calculate start and end of current 30-day period
    const periodStart = new Date(user.createdAt);
    periodStart.setDate(periodStart.getDate() + currentPeriodNumber * 30);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 30);

    return this.likeRepository.count({
      where: {
        fromPhoneNumber: phoneNumber,
        createdAt: Between(periodStart, periodEnd),
      },
    });
  }

  async getRemainingLikesAndRefreshDate(
    user: User,
  ): Promise<{ remainingLikes: number; likesRefreshedAt: Date }> {
    const likesInPeriod = await this.getLikesInCurrentPeriod(
      user.phoneNumber,
      user,
    );
    const isNew = await this.isWithinFirst24Hours(user.phoneNumber);
    const maxLikes = isNew ? NEW_USER_LIKE_LIMIT : MONTHLY_LIKE_LIMIT;

    // Calculate next refresh date based on user creation date
    const currentDate = new Date();
    const daysSinceCreation = Math.floor(
      (currentDate.getTime() - user.createdAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const currentPeriodNumber = Math.floor(daysSinceCreation / 30);

    const nextRefreshDate = new Date(user.createdAt);
    nextRefreshDate.setDate(
      nextRefreshDate.getDate() + (currentPeriodNumber + 1) * 30,
    );

    return {
      remainingLikes: maxLikes - likesInPeriod,
      likesRefreshedAt: nextRefreshDate,
    };
  }
}
