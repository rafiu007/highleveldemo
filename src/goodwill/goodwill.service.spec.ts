import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GoodwillService } from './goodwill.service';
import { User } from '../users/user.entity';
import { Like } from '../likes/like.entity';
import { LikeService } from '../likes/like.service';
import { LikeHistory } from '../likes/like-history.entity';
import { LikeHistoryService } from '../likes/like-history.service';
import { DefaultQuality, QualityCategory } from '../interfaces/qualities.enum';

describe('GoodwillService', () => {
  let service: GoodwillService;
  let likeService: LikeService;
  let testUser: User;
  let module: TestingModule;
  let userRepository: Repository<User>;
  let likeRepository: Repository<Like>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Like, LikeHistory],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User, Like, LikeHistory]),
      ],
      providers: [GoodwillService, LikeService, LikeHistoryService],
    }).compile();

    service = module.get<GoodwillService>(GoodwillService);
    likeService = module.get<LikeService>(LikeService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
  });

  beforeEach(async () => {
    // Clear repositories
    await userRepository.clear();
    await likeRepository.clear();

    // Create test user
    testUser = await userRepository.save({
      id: '1',
      phoneNumber: '+1234567890',
      createdAt: new Date(),
    });
  });

  describe('calculateQualityScores', () => {
    it('should calculate correct scores for qualities with different search statuses', async () => {
      // Create likes with different qualities and search statuses
      await likeRepository.save([
        {
          fromPhoneNumber: '+1111111111',
          toPhoneNumber: testUser.phoneNumber,
          isEndorsed: true,
          qualities: [
            {
              value: DefaultQuality.KIND,
              category: QualityCategory.EMOTIONAL,
              isDefault: true,
              usedSearch: true, // Searched quality
            },
          ],
          usedSearch: true,
        },
        {
          fromPhoneNumber: '+2222222222',
          toPhoneNumber: testUser.phoneNumber,
          isEndorsed: false,
          qualities: [
            {
              value: DefaultQuality.KIND,
              category: QualityCategory.EMOTIONAL,
              isDefault: true,
              usedSearch: false, // Non-searched quality
            },
          ],
          usedSearch: true,
        },
      ]);

      const qualityScores = await service.calculateQualityScores(testUser);
      const kindScore = qualityScores.find(
        (qs) => qs.quality.value === DefaultQuality.KIND,
      );
      expect(kindScore).toBeDefined();

      // First like: endorsed (x3) * mother quality (x2) = 6
      // Second like: mother quality (x2) * no search penalty (x0.7) = 1.4
      // Total expected: 7.4
      expect(kindScore.score).toBeCloseTo(7.4, 2);
    });

    it('should apply mother quality bonus correctly', async () => {
      await likeRepository.save({
        fromPhoneNumber: '+1111111111',
        toPhoneNumber: testUser.phoneNumber,
        isEndorsed: true,
        qualities: [
          {
            value: DefaultQuality.KIND, // DefaultQuality is a mother quality
            category: QualityCategory.EMOTIONAL,
            isDefault: true,
            usedSearch: true,
          },
        ],
        usedSearch: true,
      });

      const qualityScores = await service.calculateQualityScores(testUser);
      const kindScore = qualityScores.find(
        (qs) => qs.quality.value === DefaultQuality.KIND,
      );

      // Score calculation:
      // Base (1) * Mother quality bonus (2) * Endorsement multiplier (3) = 6
      expect(kindScore.score).toBe(6);
    });

    it('should handle multiple likes with the same quality', async () => {
      await likeRepository.save([
        {
          fromPhoneNumber: '+1111111111',
          toPhoneNumber: testUser.phoneNumber,
          qualities: [
            {
              value: DefaultQuality.WISE,
              category: QualityCategory.WISDOM,
              isDefault: true,
              usedSearch: true,
            },
          ],
          usedSearch: true,
        },
        {
          fromPhoneNumber: '+2222222222',
          toPhoneNumber: testUser.phoneNumber,
          qualities: [
            {
              value: DefaultQuality.WISE,
              category: QualityCategory.WISDOM,
              isDefault: true,
              usedSearch: false,
            },
          ],
          usedSearch: true,
        },
        {
          fromPhoneNumber: '+3333333333',
          toPhoneNumber: testUser.phoneNumber,
          qualities: [
            {
              value: DefaultQuality.WISE,
              category: QualityCategory.WISDOM,
              isDefault: true,
              usedSearch: true,
            },
          ],
          usedSearch: true,
        },
      ]);

      const qualityScores = await service.calculateQualityScores(testUser);
      const wiseScore = qualityScores.find(
        (qs) => qs.quality.value === DefaultQuality.WISE,
      );

      // Score calculation:
      // First like: base (1) * mother quality (x2) = 2
      // Second like: base (1) * mother quality (x2) * no search penalty (x0.7) = 1.4
      // Third like: base (1) * mother quality (x2) = 2
      // Total expected: 5.4
      expect(wiseScore.score).toBeCloseTo(5.4, 2);
    });

    it('should return empty array when user has no likes', async () => {
      const qualityScores = await service.calculateQualityScores(testUser);
      expect(qualityScores).toHaveLength(0);
    });
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });
});
