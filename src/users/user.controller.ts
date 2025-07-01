import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../guards/jwt.guard';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { UpdateUserDto } from './dtos/updateUser.dto';

@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/self')
  async getSelf(@UserId() userId: string) {
    return this.userService.findById(userId);
  }

  @Get(':phoneNumber')
  async getUserByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.userService.findByPhoneNumber(phoneNumber);
  }

  @Put('profile')
  async updateProfile(
    @Body() updateData: UpdateUserDto,
    @UserId() userId: string,
  ) {
    return this.userService.update(userId, updateData);
  }

  @Post('search')
  async searchUsersByPhoneNumbers(@Body() body: { phoneNumbers: string[] }) {
    return this.userService.findByPhoneNumbers(body.phoneNumbers);
  }
}
