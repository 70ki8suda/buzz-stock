import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { AuthService } from './auth.service';
import { Response } from 'express';
import { GetUser } from './get-user.decorator';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
interface Message {
  message: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    readonly userService: UserService,
  ) {}

  @Post('/signup')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'name' },
      { name: 'email' },
      { name: 'display_id' },
      { name: 'password' },
    ]),
  )
  async signupUser(
    @Body()
    userInput: {
      name: string;
      email: string;
      display_id: string;
      password: string;
    },
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.signUp(userInput);
    response.status(HttpStatus.OK).json({
      message: 'signup success',
    });
  }

  @Post('/signin')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'email' }, { name: 'password' }]),
  )
  async signinUser(
    @Body()
    userInput: {
      email: string;
      password: string;
    },
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const signinResult = await this.authService.signIn(userInput);
    const jwt = signinResult.accessToken;
    const userId = signinResult.userId;
    const hour = 3600000;
    const expires = new Date(Date.now() + 14 * 24 * hour);
    const expiresNum = Date.parse(String(expires));

    response
      .cookie('jwt', jwt, {
        sameSite: 'none',
        secure: true,
        expires: expires,
      })
      .json({ expires: expiresNum, userId: userId });
  }

  @Get('/current_user')
  @UseGuards(AuthGuard())
  async current_user(@GetUser() user: User) {
    const userId: number = user.id;
    const data = await this.authService.getCurrentUser(userId);
    return data;
  }

  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<Message> {
    response.clearCookie('jwt');
    return { message: 'success' };
  }
}
