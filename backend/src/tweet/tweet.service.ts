import { Tweet } from '.prisma/client';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTweetDto } from './tweet.dto';

@Injectable()
export class TweetService {
  constructor(private prisma: PrismaService) {}

  async createTweet(tweetData: CreateTweetDto): Promise<void> {
    await this.prisma.tweet.create({
      data: {
        ...tweetData,
        created_at: new Date(),
      },
    });
  }

  async deleteTweet(id: number, userId: number): Promise<void> {
    //check tweet's user's id ==== request user's id
    const tweet = await this.prisma.tweet.findUnique({
      where: {
        id: id,
      },
    });
    if (tweet.userId === userId) {
      await this.prisma.tweet.delete({
        where: {
          id: id,
        },
      });
    } else {
      throw new UnauthorizedException('Authorization Denied');
    }
  }

  async getTweetsByUserId(userId: number) {
    return await this.prisma.tweet.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            display_id: true,
          },
        },
      },
    });
  }
}
