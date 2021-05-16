import { Tweet } from '.prisma/client';
import { Injectable } from '@nestjs/common';
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
