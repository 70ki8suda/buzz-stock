import { User } from '.prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/get-user.decorator';
import { TweetService } from './tweet.service';
import { CreateTweetDto } from './tweet.dto';
import { Response } from 'express';

@Controller('tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post('/')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'content' }]))
  @UseGuards(AuthGuard())
  async postTweet(
    @Body()
    userInput: {
      content: string;
    },
    @GetUser() user: User,
  ): Promise<void> {
    const userId = user.id;
    const tweetData: CreateTweetDto = {
      userId: userId,
      ...userInput,
    };
    return this.tweetService.createTweet(tweetData);
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
  async getTweetsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tweets = await this.tweetService.getTweetsByUserId(userId);
    response.status(HttpStatus.OK).json({
      data: tweets,
    });
  }
}
