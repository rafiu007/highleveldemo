import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { GoodwillService } from '../goodwill/goodwill.service';
import { UserResponse } from '../interfaces';
import { LikeService } from '../likes/like.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly goodwillService: GoodwillService,
    private readonly likeService: LikeService,
  ) {}

  async activateUser(id: string) {
    await this.userRepository.update(id, { isActive: true });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const goodwill = await this.goodwillService.calculateGoodwillScore(user);
    const topThreeQualities = await this.likeService.getTopThreeQualities(user);
    return {
      id: user.id,
      name: user.name,
      profilePicture: user.profilePicture,
      linkedinUrl: user.linkedinUrl,
      instagramUrl: user.instagramUrl,
      xUrl: user.xUrl,
      facebookUrl: user.facebookUrl,
      goodwill: {
        score: goodwill.score,
        level: goodwill.level,
      },
      topThreeQualities: topThreeQualities,
    };
  }

  async findDbUserByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });

    return user;
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const goodwill = await this.goodwillService.calculateGoodwillScore(user);
    const { remainingLikes, likesRefreshedAt } =
      await this.likeService.getRemainingLikesAndRefreshDate(user);
    const topThreeQualities = await this.likeService.getTopThreeQualities(user);
    return {
      ...user,
      goodwill,
      remainingLikes,
      likesRefreshedAt,
      topThreeQualities,
    };
  }

  async findDbUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(
    createUserDto: CreateUserDto,
    isActive: boolean = false,
  ): Promise<User> {
    const user = this.userRepository.create({
      phoneNumber: createUserDto.phoneNumber,
      name: createUserDto.name,
      profilePicture: createUserDto.profilePicture,
      linkedinUrl: createUserDto.linkedinUrl,
      instagramUrl: createUserDto.instagramUrl,
      xUrl: createUserDto.xUrl,
      facebookUrl: createUserDto.facebookUrl,
      refreshToken: createUserDto.refreshToken,
      isActive: isActive,
    });
    return this.userRepository.save(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update(id, {
      name: updateUserDto.name || user.name,
      profilePicture: updateUserDto.profilePicture || user.profilePicture,
      linkedinUrl: updateUserDto.linkedinUrl || user.linkedinUrl,
      instagramUrl: updateUserDto.instagramUrl || user.instagramUrl,
      xUrl: updateUserDto.xUrl || user.xUrl,
      facebookUrl: updateUserDto.facebookUrl || user.facebookUrl,
    });
    return this.findById(id);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async findByPhoneNumbers(phoneNumbers: string[]): Promise<UserResponse[]> {
    const users = await this.userRepository.find({
      where: { phoneNumber: In(phoneNumbers) },
    });

    const topThreeQualitiesPerUser =
      await this.likeService.getTopThreeQualitiesPerUser(users);

    return users.map((user) => ({
      ...user,
      topThreeQualities: topThreeQualitiesPerUser[user.phoneNumber],
    }));
  }
}
