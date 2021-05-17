import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/get-user.decorator';

import { CreateTweetDto } from './tweet.dto';
import { TweetService } from './tweet.service';
import { User } from '.prisma/client';

@Controller('tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'content' }, { name: 'tickers' }]),
  )
  @UseGuards(AuthGuard())
  async postTweet(
    @Body()
    userInput: {
      content: string;
      tickers: string;
    },
    @GetUser() user: User,
  ) {
    const userId = user.id;
    let tickersArray = [];
    if (userInput.tickers != undefined) {
      tickersArray = userInput.tickers.split(',');
    }
    const tweetData: CreateTweetDto = {
      userId: userId,
      content: userInput.content,
      tickers: tickersArray,
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
    const userId = user.id;
    return this.tweetService.deleteTweet(id, userId);
  }

  @Get('/user/:userId')
  async getTweetsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const tweets = await this.tweetService.getTweetsByUserId(userId);
    return tweets;
  }
}
