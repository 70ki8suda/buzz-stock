import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  private async following_check(loggedinUserId: number, followId: number) {
    if (loggedinUserId) {
      const followingUsers = await this.prisma.user.findUnique({
        where: {
          id: loggedinUserId,
        },
        select: {
          following: {
            select: {
              id: true,
            },
          },
        },
      });
      const followingUsersIdArray = followingUsers.following.map(
        (user) => user.id,
      );

      return followingUsersIdArray.includes(followId);
    } else {
      return false;
    }
  }

  async getUserById(loggedinUserId: number, targetId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: targetId,
      },
      include: {
        following: true,
        followedBy: true,
        profile_image: true,
      },
    });
    delete user.password;
    delete user.salt;
    const following_num = user.following.length;
    const followers_num = user.followedBy.length;
    const following = await this.following_check(loggedinUserId, targetId);
    const returnData = {
      name: user.name,
      id: user.id,
      display_id: user.display_id,
      email: user.email,
      introduction: user.introduction,
      followers_num: followers_num,
      following_num: following_num,
      following: following,
      profile_image: user.profile_image.url,
    };
    return returnData;
  }

  async updateProfile(
    userId: number,
    updateProfile: { name?: string; introduction?: string },
    image_data,
  ): Promise<void> {
    if (Object.keys(image_data).length > 0) {
      const profileImage = image_data.profile_image[0];
      await this.uploadProfileImage(
        profileImage.buffer,
        profileImage.originalname,
        userId,
      );
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...updateProfile,
      },
    });
  }

  async follow(userId: number, followRequestId: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        following: {
          connect: [{ id: followRequestId }],
        },
      },
    });
  }

  async unfollow(userId: number, unfollowRequestId: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        following: {
          disconnect: [{ id: unfollowRequestId }],
        },
      },
    });
  }

  async uploadProfileImage(
    dataBuffer: Buffer,
    filename: string,
    userId: number,
  ) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();
    await this.prisma.profileImage.deleteMany({
      where: {
        userId: userId,
      },
    });
    await this.deleteProfileImagefromBucket(userId);
    await this.prisma.profileImage.create({
      data: {
        key: uploadResult.Key,
        url: uploadResult.Location,
        userId: userId,
      },
    });
  }

  async deleteProfileImagefromBucket(userId: number) {
    const images = await this.prisma.profileImage.findMany({
      where: {
        userId: userId,
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
