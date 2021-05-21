import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuid } from 'uuid';

import { CreateTweetDto } from './tweet.dto';

@Injectable()
export class TweetService {
  constructor(private prisma: PrismaService) {}

  async createTweet(tweetData: CreateTweetDto): Promise<void> {
    //find or create tickersArray
    const { userId, content, image_data } = tweetData;
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

    const tweet = await this.prisma.tweet.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        content: content,
        tickers: { connect: tickers },
      },
    });

    if (Object.keys(image_data).length > 0) {
      const tweet_image = image_data.tweet_image[0];

      await this.uploadTweetImage(
        tweet_image.buffer,
        tweet_image.originalname,
        tweet.id,
      );
    }

    return;
  }

  async deleteTweet(id: number, userId: number): Promise<void> {
    //check tweet's user's id ==== request user's id
    const tweet = await this.prisma.tweet.findUnique({
      where: {
        id: id,
      },
    });
    if (tweet.userId === userId) {
      await this.deleteTweetImagefromBucket(id);
      await this.prisma.tweetImage.deleteMany({
        where: {
          tweetId: id,
        },
      });
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
          favorites: true,
          tweet_image: {
            select: {
              url: true,
            },
          },
        },
      });
      return tweets;
    } catch {
      new InternalServerErrorException();
    }
  }

  async uploadTweetImage(
    dataBuffer: Buffer,
    filename: string,
    tweetId: number,
  ) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();

    const newFile = this.prisma.tweetImage.create({
      data: {
        key: uploadResult.Key,
        url: uploadResult.Location,
        tweetId: tweetId,
      },
    });

    return newFile;
  }

  async deleteTweetImagefromBucket(tweetId: number) {
    const images = await this.prisma.tweetImage.findMany({
      where: {
        tweetId: tweetId,
      },
    });
    const s3 = new S3();
    await Promise.all(
      images.map(async (image) => {
        await s3
          .deleteObject({
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
            Key: image.key,
          })
          .promise();
      }),
    );
  }
}
