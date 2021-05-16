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
interface Message {
  message: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  ): Promise<void> {
    return this.authService.signUp(userInput);
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
    response.cookie('jwt', jwt, {
      httpOnly: true,
      expires: expires,
    });

    response
      .status(HttpStatus.OK)
      .json({ expires: expiresNum, userId: userId });
  }

  @Get('/current_user')
  @UseGuards(AuthGuard())
  current_user(
    @GetUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.status(HttpStatus.OK).json({
      id: user.id,
      name: user.name,
      display_id: user.display_id,
      email: user.email,
      introduction: user.introduction,
    });
  }

  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<Message> {
    response.clearCookie('jwt');
    return { message: 'success' };
  }
}
