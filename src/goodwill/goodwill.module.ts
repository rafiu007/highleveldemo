import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodwillService } from './goodwill.service';
import { User } from '../users/user.entity';
import { Like } from 'src/likes/like.entity';
import { UserModule } from '../users/user.module';
import { LikeModule } from 'src/likes/like.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Like]),
    forwardRef(() => UserModule),
    LikeModule,
  ],
  providers: [GoodwillService],
  exports: [GoodwillService],
})
export class GoodwillModule {}
