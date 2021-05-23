import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuid } from 'uuid';

import { TweetInputDto } from './inputTweet.dto';

@Injectable()
export class TweetService {
  constructor(private prisma: PrismaService) {}

  async createTweet(
    tweetData: TweetInputDto,
    tweet_image,
    userId: number,
  ): Promise<void> {
    //find or create tickersArray
    const { content, tickers } = tweetData;
    let tickersArray = [];
    const tickersIdArray: { id: number }[] = [];
    if (tickers != undefined) {
      tickersArray = tickers.split(',');
    }
    await Promise.all(
      tickersArray.map(async (ticker) => {
        const upsertTicker = await this.prisma.ticker.upsert({
          where: {
            name: ticker,
          },
          update: {},
          create: {
            name: ticker,
          },
        });
        tickersIdArray.push({ id: upsertTicker.id });
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
        tickers: { connect: tickersIdArray },
      },
    });

    if (Object.keys(tweet_image).length > 0) {
      const tweet_image_data = tweet_image.tweet_image[0];

      await this.uploadTweetImage(
        tweet_image_data.buffer,
        tweet_image_data.originalname,
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

  async getTweetsByTicker(ticker: string) {
    try {
      const ticker_tweets = await this.prisma.ticker.findUnique({
        where: {
          name: ticker,
        },
        include: {
          tweets: {
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
          },
        },
      });
      let tweets = ticker_tweets.tweets;
      tweets = tweets.sort(function (a, b) {
        if (a.created_at > b.created_at) {
          return -1;
        } else {
          return 1;
        }
      });
      return tweets;
    } catch {
      new InternalServerErrorException();
    }
  }

  async getTweetsOfFollowingUsers(userId: number) {
    try {
      const followingUsers = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          following: {
            select: {
              id: true,
            },
          },
        },
      });
      const followingUsersIDs = followingUsers.following.map(
        (following) => following.id,
      );
      let tweets = await this.prisma.tweet.findMany({
        where: {
          userId: { in: followingUsersIDs },
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
      tweets = tweets.sort(function (a, b) {
        if (a.created_at > b.created_at) {
          return -1;
        } else {
          return 1;
        }
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
