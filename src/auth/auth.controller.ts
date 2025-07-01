import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('signup')
  async signup(@Body() data: CreateUserDto) {
    return this.authService.signup(data);
  }

  @Post('send-verification')
  async sendVerification(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.sendVerificationCode(phoneNumber);
  }

  @Post('verify')
  async verifyAndSignup(
    @Body('phoneNumber') phoneNumber: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyAndSignup(phoneNumber, code);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}
