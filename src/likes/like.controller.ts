import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtGuard } from '../guards/jwt.guard';
import { CreateLikeDto } from './dto/createLike.dto';
import { LikeHistoryService } from './like-history.service';
@Controller('likes')
@UseGuards(JwtGuard)
export class LikeController {
  constructor(
    private likeService: LikeService,
    private likeHistoryService: LikeHistoryService,
  ) {}

  @Post()
  async createLike(@Body() data: CreateLikeDto) {
    return this.likeService.createLike(data);
  }

  @Get('received')
  async getReceivedLikes(@Request() req) {
    return this.likeService.getLikes(req.user.sub);
  }

  @Delete('unlikeV2/:fromPhoneNumber/:toPhoneNumber')
  async unlikeV2(
    @Param('fromPhoneNumber') fromPhoneNumber: string,
    @Param('toPhoneNumber') toPhoneNumber: string,
  ) {
    return this.likeService.unlikeV2(fromPhoneNumber, toPhoneNumber);
  }

  @Delete('unlike/:id')
  async unlike(@Param('id') id: string) {
    return this.likeService.unlike(id);
  }

  @Put('endorseV2/:fromPhoneNumber/:toPhoneNumber')
  async endorseV2(
    @Param('fromPhoneNumber') fromPhoneNumber: string,
    @Param('toPhoneNumber') toPhoneNumber: string,
  ) {
    return this.likeService.endorseV2(fromPhoneNumber, toPhoneNumber);
  }

  @Put('endorse/:id')
  async endorse(@Param('id') id: string) {
    return this.likeService.endorse(id);
  }

  @Delete('unEndorseV2/:fromPhoneNumber/:toPhoneNumber')
  async unEndorseV2(
    @Param('fromPhoneNumber') fromPhoneNumber: string,
    @Param('toPhoneNumber') toPhoneNumber: string,
  ) {
    return this.likeService.unEndorseV2(fromPhoneNumber, toPhoneNumber);
  }

  @Put('unEndorse/:id')
  async unEndorse(@Param('id') id: string) {
    return this.likeService.unEndorse(id);
  }

  @Get('history/received/:phoneNumber')
  async getReceivedLikeHistory(@Param('phoneNumber') phoneNumber: string) {
    return this.likeHistoryService.getReceivedHistory(phoneNumber);
  }

  @Get('history/sent/:phoneNumber')
  async getSentLikeHistory(@Param('phoneNumber') phoneNumber: string) {
    return this.likeHistoryService.getSentHistory(phoneNumber);
  }
}
