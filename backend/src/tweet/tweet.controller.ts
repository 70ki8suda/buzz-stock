import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { GetUser } from 'src/auth/get-user.decorator';

import { TweetInputDto } from './inputTweet.dto';
import { TweetService } from './tweet.service';
import { User } from '.prisma/client';

@Controller('tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'content' },
      { name: 'tickers' },
      { name: 'tweet_image' },
    ]),
  )
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard())
  async postTweet(
    @Body()
    tweet: TweetInputDto,
    @GetUser() user: User,
    @UploadedFiles() tweet_image: Express.Multer.File,
  ) {
    const userId: number = user.id;

    const createTweet = await this.tweetService.createTweet(
      tweet,
      tweet_image,
      userId,
    );
    return createTweet;
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  async deleteTweet(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    const userId: number = user.id;
    return this.tweetService.deleteTweet(id, userId);
  }

  @Get('/user/:userId')
  async getTweetsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('take', ParseIntPipe) take: number,
  ) {
    const tweets = await this.tweetService.getTweetsByUserId(
      userId,
      skip,
      take,
    );
    return tweets;
  }

  @Get('/quote/:ticker')
  async getTweetsByTicker(
    @Param('ticker') ticker: string,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('take', ParseIntPipe) take: number,
  ) {
    const tweets = await this.tweetService.getTweetsByTicker(
      ticker,
      skip,
      take,
    );
    return tweets;
  }

  @Get('/following_users_feed')
  @UseGuards(AuthGuard())
  async getTweetsOfFollowingUsers(
    @GetUser() user: User,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('take', ParseIntPipe) take: number,
  ) {
    const userId: number = user.id;
    const tweets = await this.tweetService.getTweetsOfFollowingUsers(
      userId,
      skip,
      take,
    );
    return tweets;
  }
}
