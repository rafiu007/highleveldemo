import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../guards/jwt.guard';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { UpdateUserDto } from './dtos/updateUser.dto';

@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/me')
  async getMe(@UserId() userId: string) {
    return this.userService.findById(userId);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put('/me')
  async updateProfile(
    @Body() updateData: UpdateUserDto,
    @UserId() userId: string,
  ) {
    return this.userService.update(userId, updateData);
  }
}
