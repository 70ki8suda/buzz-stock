import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
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
