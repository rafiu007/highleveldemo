import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [forwardRef(() => UserModule), JwtModule.register({}), TwilioModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
