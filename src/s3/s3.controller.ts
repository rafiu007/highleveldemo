import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { S3Service } from './s3.service';
import { JwtGuard } from '../guards/jwt.guard';
import { UserId } from '../auth/decorators/user-id.decorator';

@Controller('s3')
@UseGuards(JwtGuard)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body() body: { fileType: string },
    @UserId() userId: string,
  ) {
    return this.s3Service.getSignedUploadUrl(body.fileType, userId);
  }

  @Get('read-url/:imageKey')
  async getReadUrl(@Param('imageKey') imageKey: string) {
    return this.s3Service.getSignedReadUrl(imageKey);
  }
}
