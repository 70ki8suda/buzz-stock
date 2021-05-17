import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { Response } from 'express';
import { GetUser } from 'src/auth/get-user.decorator';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserById(id);
    return user;
  }

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
}
