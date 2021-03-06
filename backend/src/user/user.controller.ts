import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { Express, Request } from 'express';
import { GetUser } from 'src/auth/get-user.decorator';

import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  @Get('/:id')
  async getUserById(
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ) {
    const cookie = request.cookies['jwt'];
    let loggedinUser;
    if (cookie) {
      loggedinUser = await this.authService.validate(cookie);
    } else {
      loggedinUser = undefined;
    }
    let loggedinUserId: number | null;
    if (loggedinUser != undefined) {
      loggedinUserId = loggedinUser.id;
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
  //   const userId: number = user.id;
  //   return await this.userService.following_check(userId, followId);
  // }

  @Patch('/update_profile')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'name' },
      { name: 'introduction' },
      { name: 'profile_image' },
    ]),
  )
  @UseGuards(AuthGuard())
  async updateProfile(
    @Body() updateProfile: { name?: string; introduction?: string },
    @GetUser() user: User,
    @UploadedFiles() profile_image: Express.Multer.File,
  ): Promise<void> {
    const userId: number = user.id;
    return this.userService.updateProfile(userId, updateProfile, profile_image);
    //console.log(updateProfile);
  }

  @Patch('/follow/:id')
  @UseGuards(AuthGuard())
  async followUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    const userId: number = user.id;
    const followRequestId = id;
    await this.userService.follow(userId, followRequestId);
  }

  @Patch('/unfollow/:id')
  @UseGuards(AuthGuard())
  async unfollowUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    const userId: number = user.id;
    const unfollowRequestId = id;
    await this.userService.unfollow(userId, unfollowRequestId);
  }
}
