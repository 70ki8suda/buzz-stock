import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

import { GetUser } from 'src/auth/get-user.decorator';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/:id')
  @UseGuards(AuthGuard())
  async getUserById(
    @Param('id', ParseIntPipe) targetId: number,
    @GetUser() user: User | undefined,
  ) {
    let loggedinUserId: number | null;
    if (user != undefined) {
      loggedinUserId = user.id;
    } else {
      loggedinUserId = null;
    }
    const data = await this.userService.getUserById(loggedinUserId, targetId);
    return data;
  }

  // @Get('/:following_test/:id')
  // @UseGuards(AuthGuard())
  // async following(
  //   @GetUser() user: User,
  //   @Param('id', ParseIntPipe) followId: number,
  // ) {
  //   const userId = user.id;
  //   return await this.userService.following_check(userId, followId);
  // }

  @Patch('/update_profile')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'name' }, { name: 'introduction' }]),
  )
  @UseGuards(AuthGuard())
  async updateProfile(
    @Body() updateProfile: { name?: string; introduction?: string },
    @GetUser() user: User,
  ): Promise<void> {
    const userId = user.id;
    return this.userService.updateProfile(updateProfile, userId);
    //console.log(updateProfile);
  }

  @Patch('/follow/:id')
  @UseGuards(AuthGuard())
  async followUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    const userId = user.id;
    const followRequestId = id;
    await this.userService.follow(userId, followRequestId);
  }

  @Patch('/unfollow/:id')
  @UseGuards(AuthGuard())
  async unfollowUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    const userId = user.id;
    const unfollowRequestId = id;
    await this.userService.unfollow(userId, unfollowRequestId);
  }
}
