import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from '../config/configuration';
import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';

import { PrismaService } from './prisma.service';

import { UserModule } from './user/user.module';
import { TweetModule } from './tweet/tweet.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    AuthModule,
    UserModule,
    TweetModule,
    FavoriteModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
