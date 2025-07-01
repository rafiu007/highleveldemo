import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeService } from './like.service';
import { LikeHistoryService } from './like-history.service';
import { Like } from './like.entity';
import { User } from '../users/user.entity';
import { LikeHistory } from './like-history.entity';
import { CreateLikeDto } from './dto/createLike.dto';
import {
  DefaultQuality,
  QualityCategory,
  LikeActionType,
} from '../interfaces/qualities.enum';
import { UserService } from '../users/user.service';
import { GoodwillService } from '../goodwill/goodwill.service';

describe('LikeService', () => {
  let service: LikeService;
  let userService: UserService;
  let dataSource: DataSource;
  let testUser1: User;
  let testUser2: User;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Like, User, LikeHistory],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Like, User, LikeHistory]),
      ],
      providers: [
        LikeService,
        LikeHistoryService,
        UserService,
        GoodwillService,
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
    dataSource = module.get<DataSource>(DataSource);
    userService = module.get<UserService>(UserService);
  }, 30000);

  beforeEach(async () => {
    // Clear likes and like history  and users before each test
    await dataSource.getRepository(Like).clear();
    await dataSource.getRepository(LikeHistory).clear();
    await dataSource.getRepository(User).clear();
    // Create test users with all required fields
    const userRepository = dataSource.getRepository(User);
    testUser1 = await userRepository.save({
      id: '1',
      email: 'test1@example.com',
      name: 'Test User 1',
      phoneNumber: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isVerified: true,
      // Add any other required fields from your User entity
    });

    testUser2 = await userRepository.save({
      id: '2',
      email: 'test2@example.com',
      name: 'Test User 2',
      phoneNumber: '+1234567891',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isVerified: true,
      // Add any other required fields from your User entity
    });
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('createLike', () => {
    it('should create a like and return it', async () => {
      const createLikeDto: CreateLikeDto = {
        toPhoneNumber: testUser2.phoneNumber,
        fromPhoneNumber: testUser1.phoneNumber,
        isEndorsed: true,
        qualities: [
          {
            value: DefaultQuality.KIND,
            category: QualityCategory.EMOTIONAL,
            isDefault: true,
          },
        ],
        usedSearch: false,
        isMotherQuality: false,
      };

      const result = await service.createLike(createLikeDto);

      expect(result.like).toBeDefined();
      expect(result.like.fromPhoneNumber).toBe(testUser1.phoneNumber);
      expect(result.like.toPhoneNumber).toBe(testUser2.phoneNumber);
      expect(result.like.isEndorsed).toBe(true);
      expect(result.like.qualities).toContainEqual({
        value: DefaultQuality.KIND,
        category: QualityCategory.EMOTIONAL,
        isDefault: true,
      });
    }, 10000);

    it('should throw error when monthly limit is reached', async () => {
      // Set user creation date to start of current 30-day period
      const userRepository = dataSource.getRepository(User);
      await userRepository.update(testUser1.id, {
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)), // This ensures we're in the first 30-day period
      });

      const createLikeDto: CreateLikeDto = {
        toPhoneNumber: testUser2.phoneNumber,
        fromPhoneNumber: testUser1.phoneNumber,
        isEndorsed: true,
        qualities: [
          {
            value: DefaultQuality.KIND,
            category: QualityCategory.EMOTIONAL,
            isDefault: true,
          },
        ],
        usedSearch: false,
        isMotherQuality: false,
      };

      // Create 3 likes (the limit) in the current 30-day period
      for (let i = 0; i < 3; i++) {
        await service.createLike(createLikeDto);
      }

      // Verify that we have 3 likes in the database
      const count = await dataSource.getRepository(Like).count({
        where: {
          fromPhoneNumber: testUser1.phoneNumber,
        },
      });
      expect(count).toBe(3);

      // Attempt to create 4th like - should throw error
      await expect(service.createLike(createLikeDto)).rejects.toThrow(
        'Monthly like limit reached',
      );
    }, 10000);
  });

  describe('getLikes', () => {
    it('should return likes received by user', async () => {
      // First create a like
      const createLikeDto: CreateLikeDto = {
        toPhoneNumber: testUser2.phoneNumber,
        fromPhoneNumber: testUser1.phoneNumber,
        isEndorsed: true,
        qualities: [
          {
            value: DefaultQuality.KIND,
            category: QualityCategory.EMOTIONAL,
            isDefault: true,
          },
        ],
        usedSearch: false,
        isMotherQuality: false,
      };
      await service.createLike(createLikeDto);

      // Then get likes
      const likes = await service.getLikes(testUser2.phoneNumber);

      expect(Array.isArray(likes)).toBe(true);
      expect(likes.length).toBe(1);
      expect(likes[0].toPhoneNumber).toBe(testUser2.phoneNumber);
      expect(likes[0].fromPhoneNumber).toBe(testUser1.phoneNumber);
    }, 10000);
  });

  describe('unlike', () => {
    it('should remove a like and create unlike history', async () => {
      // First create a like
      const createLikeDto: CreateLikeDto = {
        toPhoneNumber: testUser2.phoneNumber,
        fromPhoneNumber: testUser1.phoneNumber,
        isEndorsed: true,
        qualities: [
          {
            value: DefaultQuality.KIND,
            category: QualityCategory.EMOTIONAL,
            isDefault: true,
          },
        ],
        usedSearch: false,
        isMotherQuality: false,
      };

      const result = await service.createLike(createLikeDto);
      await service.unlike(result.like.id);

      // Verify like is removed
      const likes = await service.getLikes(testUser2.phoneNumber);
      expect(likes.length).toBe(0);

      // Verify history is created
      const historyRepository = dataSource.getRepository(LikeHistory);
      const history = await historyRepository.find({
        where: {
          fromPhoneNumber: testUser1.phoneNumber,
          toPhoneNumber: testUser2.phoneNumber,
          action: LikeActionType.UNLIKE,
        },
      });
      expect(history.length).toBe(1);
    });

    it('should throw error when trying to unlike non-existent like', async () => {
      await expect(service.unlike('non-existent-id')).rejects.toThrow(
        'Like not found',
      );
    });
  });

  describe('endorse/unendorse', () => {
    let likeId: string;

    beforeEach(async () => {
      const createLikeDto: CreateLikeDto = {
        toPhoneNumber: testUser2.phoneNumber,
        fromPhoneNumber: testUser1.phoneNumber,
        isEndorsed: false,
        qualities: [
          {
            value: DefaultQuality.KIND,
            category: QualityCategory.EMOTIONAL,
            isDefault: true,
          },
        ],
        usedSearch: false,
        isMotherQuality: false,
      };

      const result = await service.createLike(createLikeDto);
      likeId = result.like.id;
    });

    it('should endorse a like and create history', async () => {
      await service.endorse(likeId);

      const like = await dataSource.getRepository(Like).findOne({
        where: { id: likeId },
      });
      expect(like.isEndorsed).toBe(true);

      const history = await dataSource.getRepository(LikeHistory).findOne({
        where: {
          fromPhoneNumber: testUser1.phoneNumber,
          toPhoneNumber: testUser2.phoneNumber,
          action: LikeActionType.ENDORSE,
        },
      });
      expect(history).toBeDefined();
    });

    it('should unendorse a like and create history', async () => {
      // First endorse
      await service.endorse(likeId);
      // Then unendorse
      await service.unEndorse(likeId);

      const like = await dataSource.getRepository(Like).findOne({
        where: { id: likeId },
      });
      expect(like.isEndorsed).toBe(false);

      const history = await dataSource.getRepository(LikeHistory).findOne({
        where: {
          fromPhoneNumber: testUser1.phoneNumber,
          toPhoneNumber: testUser2.phoneNumber,
          action: LikeActionType.UNENDORSE,
        },
      });
      expect(history).toBeDefined();
    });
  });

  describe('getTopThreeQualities', () => {
    beforeEach(async () => {
      // Create additional test users for likes
      const userRepository = dataSource.getRepository(User);
      const extraUsers = await Promise.all([
        userRepository.save({
          id: '3',
          email: 'test3@example.com',
          name: 'Test User 3',
          phoneNumber: '+1234567892',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        userRepository.save({
          id: '4',
          email: 'test4@example.com',
          name: 'Test User 4',
          phoneNumber: '+1234567893',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        userRepository.save({
          id: '5',
          email: 'test5@example.com',
          name: 'Test User 5',
          phoneNumber: '+1234567894',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]);

      // Create multiple likes with different qualities from different users
      const qualities = [
        { value: DefaultQuality.KIND, count: 5 },
        { value: DefaultQuality.WISE, count: 3 },
        { value: DefaultQuality.CREATIVE, count: 4 },
        { value: DefaultQuality.BOLD, count: 1 },
      ];

      for (const quality of qualities) {
        for (let i = 0; i < quality.count; i++) {
          // Use a different user for each like to avoid monthly limit
          const fromUser = extraUsers[i % extraUsers.length];
          await service.createLike({
            toPhoneNumber: testUser2.phoneNumber,
            fromPhoneNumber: fromUser.phoneNumber,
            isEndorsed: true,
            qualities: [
              {
                value: quality.value,
                category: QualityCategory.EMOTIONAL,
                isDefault: true,
              },
            ],
            usedSearch: false,
            isMotherQuality: false,
          });
        }
      }
    });

    it('should return top three qualities sorted by frequency', async () => {
      const topQualities = await service.getTopThreeQualities(testUser2);

      expect(topQualities).toHaveLength(3);
      expect(topQualities[0].value).toBe(DefaultQuality.KIND);
      expect(topQualities[1].value).toBe(DefaultQuality.CREATIVE);
      expect(topQualities[2].value).toBe(DefaultQuality.WISE);
    });
  });

  describe('getTopThreeQualitiesPerUser', () => {
    beforeEach(async () => {
      // Create likes for both users with different qualities
      const usersQualities = [
        {
          user: testUser1,
          qualities: [
            { value: DefaultQuality.KIND, count: 3 },
            { value: DefaultQuality.WISE, count: 2 },
          ],
        },
        {
          user: testUser2,
          qualities: [
            { value: DefaultQuality.CREATIVE, count: 4 },
            { value: DefaultQuality.BOLD, count: 1 },
          ],
        },
      ];

      for (const userQuality of usersQualities) {
        for (const quality of userQuality.qualities) {
          for (let i = 0; i < quality.count; i++) {
            await service.createLike({
              toPhoneNumber: userQuality.user.phoneNumber,
              fromPhoneNumber: testUser1.phoneNumber,
              isEndorsed: true,
              qualities: [
                {
                  value: quality.value,
                  category: QualityCategory.EMOTIONAL,
                  isDefault: true,
                },
              ],
              usedSearch: false,
              isMotherQuality: false,
            });
          }
        }
      }
    });

    it('should return top qualities for multiple users', async () => {
      const result = await service.getTopThreeQualitiesPerUser([
        testUser1,
        testUser2,
      ]);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result[testUser1.phoneNumber][0].value).toBe(DefaultQuality.KIND);
      expect(result[testUser2.phoneNumber][0].value).toBe(
        DefaultQuality.CREATIVE,
      );
    });
  });

  it('create user and then update user', async () => {
    const userRepository = dataSource.getRepository(User);
    testUser1 = await userRepository.save({
      id: '1',
      email: 'test1@example.com',
      name: 'Test User 1',
      phoneNumber: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isVerified: true,
      // Add any other required fields from your User entity
    });

    const updatedUser = await userService.update(testUser1.id, {
      name: 'Updated User',
      profilePicture: 'https://example.com/updated-profile.jpg',
      linkedinUrl: 'https://linkedin.com/in/updated-user',
      instagramUrl: 'https://instagram.com/updated-user',
      xUrl: 'https://x.com/updated-user',
      facebookUrl: 'https://facebook.com/updated-user',
    });

    expect(updatedUser.name).toBe('Updated User');
    expect(updatedUser.profilePicture).toBe(
      'https://example.com/updated-profile.jpg',
    );
    expect(updatedUser.linkedinUrl).toBe(
      'https://linkedin.com/in/updated-user',
    );
    expect(updatedUser.instagramUrl).toBe('https://instagram.com/updated-user');
    expect(updatedUser.xUrl).toBe('https://x.com/updated-user');
    expect(updatedUser.facebookUrl).toBe('https://facebook.com/updated-user');
  });

  it('like a user that does not exist it should create a new user', async () => {
    const createLikeDto: CreateLikeDto = {
      toPhoneNumber: '+1234567895',
      fromPhoneNumber: testUser1.phoneNumber,
      isEndorsed: true,
      qualities: [],
      usedSearch: false,
      isMotherQuality: false,
    };

    await service.createLike(createLikeDto);

    const user = await userService.findByPhoneNumber('+1234567895');

    expect(user).toBeDefined();
  });
});
