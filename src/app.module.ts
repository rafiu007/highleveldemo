import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { TwilioModule } from './twilio/twilio.module';
import { GoodwillModule } from './goodwill/goodwill.module';
import { LikeModule } from './likes/like.module';
import { GuardsModule } from './guards/guards.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'goodwill_dev',
      autoLoadEntities: true,
      synchronize: false,
      // extra:
      //   process.env.DEPLOYMENT_ENV === 'production' ||
      //   process.env.DEPLOYMENT_ENV === 'staging'
      //     ? { ca: process.env.SSL_KEY }
      //     : { ssl: { mode: 'require' } },

      logging: true,
      connectTimeoutMS: 5000,
    }),
    UserModule,
    AuthModule,
    TwilioModule,
    GoodwillModule,
    LikeModule,
    GuardsModule,
    S3Module,
  ],
  providers: [],
})
export class AppModule {}
