import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { GuardsModule } from '../guards/guards.module';
import { AuthModule } from '../auth/auth.module';
import { GoodwillModule } from '../goodwill/goodwill.module';
import { LikeModule } from 'src/likes/like.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    GuardsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => GoodwillModule),
    forwardRef(() => LikeModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
