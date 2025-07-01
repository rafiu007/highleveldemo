import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(DataSource);
  }, 30000);

  beforeEach(async () => {
    // Clear users before each test
    await dataSource.getRepository(User).clear();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        profilePicture: 'https://example.com/avatar.jpg',
      };

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.name).toBe(createUserDto.name);
      expect(result.profilePicture).toBe(createUserDto.profilePicture);
      expect(result.isActive).toBe(true);
      expect(result.password).not.toBe(createUserDto.password); // Password should be hashed
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      // Verify password is properly hashed
      const isPasswordValid = await bcrypt.compare(
        createUserDto.password,
        result.password,
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should create a user with minimal data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'minimal@example.com',
        password: 'password123',
      };

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.name).toBeNull();
      expect(result.profilePicture).toBeNull();
      expect(result.isActive).toBe(true);
    });
  });

  describe('findByEmail', () => {
    let testUser: User;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'find@example.com',
        password: 'password123',
        name: 'Find Test User',
      };
      testUser = await service.create(createUserDto);
    });

    it('should find user by email', async () => {
      const result = await service.findByEmail('find@example.com');

      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
      expect(result.name).toBe(testUser.name);
    });

    it('should return null when user not found', async () => {
      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    let testUser: User;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'findbyid@example.com',
        password: 'password123',
        name: 'Find By ID Test User',
      };
      testUser = await service.create(createUserDto);
    });

    it('should find user by id', async () => {
      const result = await service.findById(testUser.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
      expect(result.name).toBe(testUser.name);
    });

    it('should throw NotFoundException when user not found', async () => {
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    let testUser: User;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'update@example.com',
        password: 'password123',
        name: 'Update Test User',
        profilePicture: 'https://example.com/old-avatar.jpg',
      };
      testUser = await service.create(createUserDto);
    });

    it('should update user name and profile picture', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        profilePicture: 'https://example.com/new-avatar.jpg',
      };

      const result = await service.update(testUser.id, updateUserDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.name).toBe(updateUserDto.name);
      expect(result.profilePicture).toBe(updateUserDto.profilePicture);
      expect(result.email).toBe(testUser.email); // Email should remain unchanged
    });

    it('should update user password', async () => {
      const newPassword = 'newpassword123';
      const updateUserDto: UpdateUserDto = {
        password: newPassword,
      };

      const result = await service.update(testUser.id, updateUserDto);

      expect(result).toBeDefined();
      expect(result.password).not.toBe(newPassword); // Password should be hashed
      expect(result.password).not.toBe(testUser.password); // Password should be different from original

      // Verify new password is properly hashed
      const isPasswordValid = await bcrypt.compare(
        newPassword,
        result.password,
      );
      expect(isPasswordValid).toBe(true);

      // Verify old password no longer works
      const isOldPasswordValid = await bcrypt.compare(
        'password123',
        result.password,
      );
      expect(isOldPasswordValid).toBe(false);
    });

    it('should update only provided fields', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Only Name Updated',
      };

      const result = await service.update(testUser.id, updateUserDto);

      expect(result.name).toBe(updateUserDto.name);
      expect(result.profilePicture).toBe(testUser.profilePicture); // Should remain unchanged
      expect(result.email).toBe(testUser.email); // Should remain unchanged
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Non-existent User',
      };

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    let testUser: User;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'validate@example.com',
        password: 'password123',
        name: 'Validate Test User',
      };
      testUser = await service.create(createUserDto);
    });

    it('should return true for correct password', async () => {
      const result = await service.validatePassword(testUser, 'password123');

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const result = await service.validatePassword(testUser, 'wrongpassword');

      expect(result).toBe(false);
    });
  });

  describe('updateRefreshToken', () => {
    let testUser: User;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'refresh@example.com',
        password: 'password123',
        name: 'Refresh Test User',
      };
      testUser = await service.create(createUserDto);
    });

    it('should update refresh token', async () => {
      const refreshToken = 'new-refresh-token';

      await service.updateRefreshToken(testUser.id, refreshToken);

      const updatedUser = await service.findById(testUser.id);
      expect(updatedUser.refreshToken).toBe(refreshToken);
    });

    it('should clear refresh token when null is provided', async () => {
      // First set a refresh token
      await service.updateRefreshToken(testUser.id, 'some-token');

      // Then clear it
      await service.updateRefreshToken(testUser.id, null);

      const updatedUser = await service.findById(testUser.id);
      expect(updatedUser.refreshToken).toBeNull();
    });
  });

  describe('activateUser', () => {
    let testUser: User;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'activate@example.com',
        password: 'password123',
        name: 'Activate Test User',
      };
      testUser = await service.create(createUserDto);

      // Manually set user as inactive
      await dataSource
        .getRepository(User)
        .update(testUser.id, { isActive: false });
    });

    it('should activate user', async () => {
      await service.activateUser(testUser.id);

      const updatedUser = await service.findById(testUser.id);
      expect(updatedUser.isActive).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    let testUser: User;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'deactivate@example.com',
        password: 'password123',
        name: 'Deactivate Test User',
      };
      testUser = await service.create(createUserDto);
    });

    it('should deactivate user', async () => {
      await service.deactivateUser(testUser.id);

      const updatedUser = await service.findById(testUser.id);
      expect(updatedUser.isActive).toBe(false);
    });
  });

  describe('complete user lifecycle', () => {
    it('should create, update, and verify user through complete lifecycle', async () => {
      // Create user
      const createUserDto: CreateUserDto = {
        email: 'lifecycle@example.com',
        password: 'initialpassword123',
        name: 'Lifecycle Test User',
      };

      const createdUser = await service.create(createUserDto);
      expect(createdUser.email).toBe(createUserDto.email);
      expect(createdUser.name).toBe(createUserDto.name);
      expect(createdUser.isActive).toBe(true);

      // Find by email
      const foundByEmail = await service.findByEmail(createUserDto.email);
      expect(foundByEmail).toBeDefined();
      expect(foundByEmail.id).toBe(createdUser.id);

      // Find by ID
      const foundById = await service.findById(createdUser.id);
      expect(foundById).toBeDefined();
      expect(foundById.email).toBe(createUserDto.email);

      // Update user
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Lifecycle User',
        profilePicture: 'https://example.com/new-profile.jpg',
        password: 'newpassword123',
      };

      const updatedUser = await service.update(createdUser.id, updateUserDto);
      expect(updatedUser.name).toBe(updateUserDto.name);
      expect(updatedUser.profilePicture).toBe(updateUserDto.profilePicture);

      // Validate old password should fail
      const oldPasswordValid = await service.validatePassword(
        updatedUser,
        'initialpassword123',
      );
      expect(oldPasswordValid).toBe(false);

      // Validate new password should succeed
      const newPasswordValid = await service.validatePassword(
        updatedUser,
        'newpassword123',
      );
      expect(newPasswordValid).toBe(true);

      // Update refresh token
      const refreshToken = 'sample-refresh-token';
      await service.updateRefreshToken(updatedUser.id, refreshToken);

      const userWithRefreshToken = await service.findById(updatedUser.id);
      expect(userWithRefreshToken.refreshToken).toBe(refreshToken);

      // Deactivate user
      await service.deactivateUser(updatedUser.id);
      const deactivatedUser = await service.findById(updatedUser.id);
      expect(deactivatedUser.isActive).toBe(false);

      // Reactivate user
      await service.activateUser(updatedUser.id);
      const reactivatedUser = await service.findById(updatedUser.id);
      expect(reactivatedUser.isActive).toBe(true);
    });
  });

  describe('multiple users operations', () => {
    it('should handle multiple users with different emails', async () => {
      const users = [
        {
          email: 'user1@example.com',
          password: 'password123',
          name: 'User One',
        },
        {
          email: 'user2@example.com',
          password: 'password456',
          name: 'User Two',
        },
        {
          email: 'user3@example.com',
          password: 'password789',
          name: 'User Three',
        },
      ];

      // Create multiple users
      const createdUsers = [];
      for (const userData of users) {
        const user = await service.create(userData);
        createdUsers.push(user);
      }

      expect(createdUsers).toHaveLength(3);

      // Verify each user can be found by email
      for (let i = 0; i < users.length; i++) {
        const foundUser = await service.findByEmail(users[i].email);
        expect(foundUser).toBeDefined();
        expect(foundUser.email).toBe(users[i].email);
        expect(foundUser.name).toBe(users[i].name);
        expect(foundUser.id).toBe(createdUsers[i].id);
      }

      // Verify each user can be found by ID
      for (const createdUser of createdUsers) {
        const foundUser = await service.findById(createdUser.id);
        expect(foundUser).toBeDefined();
        expect(foundUser.id).toBe(createdUser.id);
      }

      // Update each user with different data
      const updateData = [
        {
          name: 'Updated User One',
          profilePicture: 'https://example.com/user1.jpg',
        },
        {
          name: 'Updated User Two',
          profilePicture: 'https://example.com/user2.jpg',
        },
        {
          name: 'Updated User Three',
          profilePicture: 'https://example.com/user3.jpg',
        },
      ];

      for (let i = 0; i < createdUsers.length; i++) {
        const updatedUser = await service.update(
          createdUsers[i].id,
          updateData[i],
        );
        expect(updatedUser.name).toBe(updateData[i].name);
        expect(updatedUser.profilePicture).toBe(updateData[i].profilePicture);
      }
    });
  });
});
