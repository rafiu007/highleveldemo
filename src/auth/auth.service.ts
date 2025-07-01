import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private jwtService: JwtService,
  ) {}

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        expiresIn: '30d',
      }),
    ]);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        workspaceId: user.workspaceId,
        workspace: user.workspace,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      });

      const user = await this.userService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signup(createUserDto: CreateUserDto) {
    try {
      this.logger.log('Starting signup process for:', createUserDto.email);

      const existingUser = await this.userService.findByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      let workspaceId = createUserDto.workspaceId;

      // If no workspaceId provided, create a default workspace
      if (!workspaceId) {
        this.logger.log('No workspace provided, creating default workspace...');
        const defaultWorkspace = await this.workspaceService.create({
          name: `${createUserDto.name || 'User'}'s Workspace`,
          description: 'Default workspace created during signup',
        });
        workspaceId = defaultWorkspace.id;
        this.logger.log('Default workspace created:', workspaceId);
      }

      this.logger.log('Creating new user with workspaceId:', workspaceId);
      const user = await this.userService.create({
        ...createUserDto,
        workspaceId,
      });
      this.logger.log('User created successfully, generating tokens...');

      const tokens = await this.generateTokens(user);
      this.logger.log('Tokens generated successfully');

      return tokens;
    } catch (error) {
      this.logger.error('Signup error:', error.message);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(
      user,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}
