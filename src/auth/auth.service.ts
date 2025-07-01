import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { User } from '../users/user.entity';
import { TwilioService } from '../twilio/twilio.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private twilioService: TwilioService,
  ) {}

  async generateTokens(user: User, newUser: boolean = false) {
    const payload = { sub: user.id, phone: user.phoneNumber };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        profilePicture: user.profilePicture,
        linkedinUrl: user.linkedinUrl,
        instagramUrl: user.instagramUrl,
        xUrl: user.xUrl,
        facebookUrl: user.facebookUrl,
        newUser,
      },
    };
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userService.findDbUserById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user, false);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async signup(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByPhoneNumber(
      createUserDto.phoneNumber,
    );
    if (existingUser) {
      throw new UnauthorizedException('Phone number already registered');
    }

    const user = await this.userService.create({
      ...createUserDto,
      refreshToken: null,
    });
    return this.generateTokens(user);
  }

  async sendVerificationCode(phoneNumber: string) {
    await this.twilioService.sendVerificationCode(phoneNumber);
    return { message: 'Verification code sent' };
  }

  async verifyAndSignup(phoneNumber: string, code: string) {
    const isValid = await this.twilioService.verifyCode(phoneNumber, code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Check if user already exists
    const existingUser =
      await this.userService.findDbUserByPhoneNumber(phoneNumber);
    if (existingUser) {
      await this.userService.activateUser(existingUser.id);
      return this.generateTokens(existingUser, false);
    }

    const user = await this.userService.create(
      {
        phoneNumber,
        refreshToken: null,
      },
      true,
    );

    return this.generateTokens(user, true);
  }
}
