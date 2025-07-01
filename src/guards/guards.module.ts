import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  providers: [JwtGuard],
  exports: [JwtGuard, JwtModule],
})
export class GuardsModule {}
