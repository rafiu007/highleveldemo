import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { UserId } from './decorators/user-id.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log('Signup attempt:', createUserDto);
      const result = await this.authService.signup(createUserDto);
      this.logger.log('Signup successful');
      return result;
    } catch (error) {
      this.logger.error('Signup error:', error.message);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@UserId() userId: string) {
    return this.authService.logout(userId);
  }
}
