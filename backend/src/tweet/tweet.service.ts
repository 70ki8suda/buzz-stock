import { Ticker, Tweet } from '.prisma/client';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTweetDto } from './tweet.dto';

@Injectable()
export class TweetService {
  constructor(private prisma: PrismaService) {}

  async createTweet(tweetData: CreateTweetDto): Promise<void> {
    //find or create tickersArray
    const tickers: { id: number }[] = [];
    await Promise.all(
      tweetData.tickers.map(async (ticker) => {
        const upsertTicker = await this.prisma.ticker.upsert({
          where: {
            name: ticker,
          },
          update: {},
          create: {
            name: ticker,
          },
        });
        tickers.push({ id: upsertTicker.id });
      }),
    );

    await this.prisma.tweet.create({
      data: {
        user: {
          connect: {
            id: tweetData.userId,
          },
        },
        content: tweetData.content,
        tickers: { connect: tickers },
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
    try {
      const tweets = await this.prisma.tweet.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              display_id: true,
              profile_image: {
                select: {
                  url: true,
                },
              },
            },
          },
          tickers: true,
        },
      });
      return tweets;
    } catch {
      new InternalServerErrorException();
    }
  }
}
