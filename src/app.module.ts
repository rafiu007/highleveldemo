import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { GuardsModule } from './guards/guards.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ContactModule } from './contacts/contact.module';
import { ContactEventModule } from './contact-events/contact-event.module';

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
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      connectTimeoutMS: 5000,
    }),
    UserModule,
    AuthModule,
    GuardsModule,
    WorkspaceModule,
    ContactModule,
    ContactEventModule,
  ],
  providers: [],
})
export class AppModule {}
