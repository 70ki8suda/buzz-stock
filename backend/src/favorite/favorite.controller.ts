import { User } from '.prisma/client';
import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { FavoriteService } from './favorite.service';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('/:tweetId')
  @UseGuards(AuthGuard())
  async favoriteTweet(
    @Param('tweetId', ParseIntPipe) tweetId: number,
    @GetUser() user: User,
  ): Promise<void> {
    const userId: number = user.id;
    return this.favoriteService.favoriteTweet(tweetId, userId);
  }

  @Delete('/:tweetId')
  @UseGuards(AuthGuard())
  async unfavoriteTweet(
    @Param('tweetId', ParseIntPipe) tweetId: number,
    @GetUser() user: User,
  ): Promise<void> {
    const userId: number = user.id;
    return this.favoriteService.unfavoriteTweet(tweetId, userId);
  }
}
