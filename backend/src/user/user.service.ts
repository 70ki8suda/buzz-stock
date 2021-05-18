import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

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
    };
    return returnData;
  }

  async updateProfile(
    updateProfile: { name?: string; introduction?: string },
    userId: number,
  ): Promise<void> {
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
}
