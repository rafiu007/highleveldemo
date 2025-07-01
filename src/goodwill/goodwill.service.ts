import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { User } from '../users/user.entity';
import { Like } from '../likes/like.entity';
import {
  DefaultQuality,
  QualityWithMetadata,
} from '../interfaces/qualities.enum';
import { LikeService } from '../likes/like.service';

const WEIGHTS = {
  ENDORSEMENT_MULTIPLIER: 3, // endorsement = 3 * like
  NO_SEARCH_PENALTY: 0.7, // penalty for not using search
  RETURN_LIKE_PENALTY: 0.85, // penalty for return likes
};

const GOODWILL_LEVELS = {
  DEVELOPING: { max: 3, name: 'Developing' },
  MODERATE: { max: 20, name: 'Moderate' },
  HIGH: { max: 60, name: 'High' },
  VERY_HIGH: { max: 100, name: 'Very High' },
  EXCEPTIONAL: { min: 100, name: 'Exceptional' },
};

const STANDARD_INCREASE = {
  NORMAL: 1, // 1 unit for normal like
  MOTHER_QUALITY: 2, // 2 units for mother-quality
};

interface QualityScore {
  quality: QualityWithMetadata;
  score: number;
}

@Injectable()
export class GoodwillService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private likeService: LikeService,
  ) {}

  async calculateGoodwillScore(user: User): Promise<{
    score: number;
    level: string;
    breakdown: any;
    qualityScores: QualityScore[];
  }> {
    const likes = await this.likeRepository.find({
      where: { toPhoneNumber: user.phoneNumber },
      order: { createdAt: 'ASC' },
    });

    const breakdown = {
      baseScore: 0,
      penalties: {
        noSearchPenalty: 0,
        returnLikePenalty: 0,
        farmAccountPenalty: 0,
      },
      adjustments: {},
    };

    // Calculate base score
    for (const like of likes) {
      let likeValue = STANDARD_INCREASE.NORMAL;

      // Endorsement multiplier
      if (like.isEndorsed) {
        likeValue *= WEIGHTS.ENDORSEMENT_MULTIPLIER;
      }

      // Mother quality bonus
      if (this.hasMotherQualities(like.qualities)) {
        likeValue *= STANDARD_INCREASE.MOTHER_QUALITY;
      }

      // Apply no-search penalty if applicable
      if (!like.usedSearch) {
        likeValue *= WEIGHTS.NO_SEARCH_PENALTY;
        breakdown.penalties.noSearchPenalty +=
          (1 - WEIGHTS.NO_SEARCH_PENALTY) * likeValue;
      }

      // Apply return like penalty
      if (await this.isReturnLike(user, like)) {
        likeValue *= WEIGHTS.RETURN_LIKE_PENALTY;
        breakdown.penalties.returnLikePenalty +=
          (1 - WEIGHTS.RETURN_LIKE_PENALTY) * likeValue;
      }

      // Farm account detection and penalty
      if (await this.isFromFarmAccount(like)) {
        likeValue *= 0.5; // 50% penalty for farm accounts
        breakdown.penalties.farmAccountPenalty += 0.5 * likeValue;
      }

      breakdown.baseScore += likeValue;
    }

    const finalScore = breakdown.baseScore;

    const qualityScores = await this.calculateQualityScores(user);

    return {
      score: finalScore,
      level: this.getScoreLevel(finalScore),
      breakdown,
      qualityScores,
    };
  }

  private hasMotherQualities(qualities: QualityWithMetadata[]): boolean {
    // Define mother qualities and check if any are present
    const motherQualities = Object.values(DefaultQuality);
    return qualities.some((q) =>
      motherQualities.includes(q.value as DefaultQuality),
    );
  }

  private async isReturnLike(user: User, like: Like): Promise<boolean> {
    // Check if this is a return like (user liked someone who previously liked them)
    const previousLike = await this.likeRepository.findOne({
      where: {
        fromPhoneNumber: like.toPhoneNumber,
        toPhoneNumber: like.fromPhoneNumber,
        createdAt: LessThan(like.createdAt),
      },
    });
    return !!previousLike;
  }

  private async isFromFarmAccount(like: Like): Promise<boolean> {
    // Check for farm account characteristics
    const recentLikes = await this.likeRepository.count({
      where: {
        fromPhoneNumber: like.fromPhoneNumber,
        createdAt: LessThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      },
    });

    const immediateNewUserLikes = await this.getLikesToNewUsers(
      like.fromPhoneNumber,
    );
    const disconnectedCommunityScore =
      await this.calculateCommunityDisconnection(like.fromPhoneNumber);

    // Determine if it's a farm account based on multiple factors
    return (
      recentLikes > 50 || // Aggressive sending
      immediateNewUserLikes > 10 || // Too many likes to new users
      disconnectedCommunityScore > 0.8 // Disconnected community pattern
    );
  }

  private async getLikesToNewUsers(fromPhoneNumber: string): Promise<number> {
    // Count likes to users within their first hour of creation
    const likes = await this.likeRepository.find({
      where: { fromPhoneNumber },
    });

    const toUsers = await this.userRepository.find({
      where: { phoneNumber: In(likes.map((like) => like.toPhoneNumber)) },
    });

    return likes.filter((like) => {
      const toUser = toUsers.find(
        (user) => user.phoneNumber === like.toPhoneNumber,
      );
      if (!toUser?.createdAt) return false;
      const userAge =
        new Date().getTime() - new Date(toUser.createdAt).getTime();
      return userAge <= 60 * 60 * 1000; // 1 hour in milliseconds
    }).length;
  }

  private async calculateCommunityDisconnection(
    phoneNumber: string,
  ): Promise<number> {
    console.log(`Calculating community disconnection for ${phoneNumber}`);
    // Calculate how disconnected the user's like network is
    // Returns a score between 0 and 1, where 1 is completely disconnected
    // Implementation depends on your specific requirements
    return 0; // Placeholder
  }

  private getScoreLevel(score: number): string {
    if (score >= GOODWILL_LEVELS.EXCEPTIONAL.min)
      return GOODWILL_LEVELS.EXCEPTIONAL.name;
    if (score >= GOODWILL_LEVELS.VERY_HIGH.max)
      return GOODWILL_LEVELS.VERY_HIGH.name;
    if (score >= GOODWILL_LEVELS.HIGH.max) return GOODWILL_LEVELS.HIGH.name;
    if (score >= GOODWILL_LEVELS.MODERATE.max)
      return GOODWILL_LEVELS.MODERATE.name;
    return GOODWILL_LEVELS.DEVELOPING.name;
  }

  async calculateQualityScores(user: User): Promise<QualityScore[]> {
    const qualities = await this.likeService.getTopThreeQualities(user);
    const likes = await this.likeRepository.find({
      where: { toPhoneNumber: user.phoneNumber },
      order: { createdAt: 'ASC' },
    });

    // Calculate score for each of the top 3 qualities
    return qualities.map((quality) => {
      let totalScore = 0;

      // Look at each like that contains this quality
      for (const like of likes) {
        const matchingQuality = like.qualities.find(
          (q) => q.value === quality.value && q.category === quality.category,
        );

        if (matchingQuality) {
          let likeValue = STANDARD_INCREASE.NORMAL;

          if (like.isEndorsed) {
            likeValue *= WEIGHTS.ENDORSEMENT_MULTIPLIER;
          }

          if (this.hasMotherQualities([matchingQuality])) {
            likeValue *= STANDARD_INCREASE.MOTHER_QUALITY;
          }

          // Use the usedSearch property from the quality itself
          if (!matchingQuality.usedSearch) {
            likeValue *= WEIGHTS.NO_SEARCH_PENALTY;
          }

          totalScore += likeValue;
        }
      }

      return {
        quality,
        score: totalScore,
      };
    });
  }
}
