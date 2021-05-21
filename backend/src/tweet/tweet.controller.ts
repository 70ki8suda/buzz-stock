import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { GetUser } from 'src/auth/get-user.decorator';

import { CreateTweetDto } from './tweet.dto';
import { TweetService } from './tweet.service';
import { User } from '.prisma/client';

@Controller('tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post('/')
  //@UseInterceptors(FileInterceptor('tweet_image'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'content' },
      { name: 'tickers' },
      { name: 'tweet_image' },
    ]),
  )
  @UseGuards(AuthGuard())
  async postTweet(
    @Body()
    tweet: {
      content: string;
      tickers?: string;
    },
    @GetUser() user: User,
    @UploadedFiles() tweet_image: Express.Multer.File,
  ) {
    const userId: number = user.id;
    let tickersArray = [];
    console.log(tweet);
    if (tweet.tickers != undefined) {
      tickersArray = tweet.tickers.split(',');
    }
    const tweetData: CreateTweetDto = {
      userId: userId,
      content: tweet.content,
      tickers: tickersArray,
      image_data: tweet_image,
    };
    await this.tweetService.createTweet(tweetData);
    return 'tweet posted';
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
  async getTweetsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const tweets = await this.tweetService.getTweetsByUserId(userId);
    return tweets;
  }

  @Get('/quote/:ticker')
  async getTweetsByTicker(@Param('ticker') ticker: string) {
    const tweets = await this.tweetService.getTweetsByTicker(ticker);
    return tweets;
  }

  @Get('/following_users_feed')
  @UseGuards(AuthGuard())
  async getTweetsOfFollowingUsers(@GetUser() user: User) {
    const userId: number = user.id;
    const tweets = await this.tweetService.getTweetsOfFollowingUsers(userId);
    return tweets;
  }
}
