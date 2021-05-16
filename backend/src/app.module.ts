import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostService } from './post.service';
import { PrismaService } from './prisma.service';
import { UserService } from './user.service';
import { UserModule } from './user/user.module';
import { TweetModule } from './tweet/tweet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    AuthModule,
    UserModule,
    TweetModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, PostService, PrismaService],
})
export class AppModule {}
