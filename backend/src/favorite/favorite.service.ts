import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async favoriteTweet(tweetId: number, userId: number) {
    await this.prisma.favorite.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        tweet: {
          connect: {
            id: tweetId,
          },
        },
      },
    });
  }

  async unfavoriteTweet(tweetId: number, userId: number) {
    await this.prisma.favorite.deleteMany({
      where: {
        tweetId: tweetId,
        userId: userId,
      },
    });
  }
}
