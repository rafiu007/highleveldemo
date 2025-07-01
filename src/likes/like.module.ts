import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { Like } from './like.entity';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';
import { GuardsModule } from 'src/guards/guards.module';
import { LikeHistoryService } from './like-history.service';
import { LikeHistory } from './like-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, User, LikeHistory]),
    AuthModule,
    GuardsModule,
  ],
  providers: [LikeService, LikeHistoryService],
  controllers: [LikeController],
  exports: [LikeService],
})
export class LikeModule {}
