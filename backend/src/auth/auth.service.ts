import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma.service';
import { JwtPayload } from './jwt-payload.interface';
import { signUpDto } from './signup.dto';
import { logInDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async validate(cookie) {
    const data = await this.jwtService.verifyAsync(cookie);
    if (!data) {
      throw new UnauthorizedException();
    }
    return data;
  }

  async signUp(userInput: signUpDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedData: Prisma.UserCreateInput = { ...userInput, salt };

    hashedData.password = await this.hashPassword(
      userInput.password,
      hashedData.salt,
    );
    try {
      if (userInput.password === null) {
        throw new UnauthorizedException('Password ');
      }
      await this.prisma.user.create({
        data: { ...hashedData },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (error.code === 'P2002') {
          throw new ConflictException('EmailかIDが既に使われています');
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  }

  async signIn(
    userInput: logInDto,
  ): Promise<{ accessToken: string; userId: number }> {
    const user = await this.validateUserPassword(userInput);
    const user_id = user.id;
    if (!user) {
      throw new UnauthorizedException('パスワードが一致しません');
    }
    const payload: JwtPayload = { id: user_id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken: accessToken, userId: user_id };
  }

  async validatePassword(
    password: string,
    salt: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const hash = await bcrypt.hash(password, salt);
    return hash === hashedPassword;
  }

  async validateUserPassword(userInput: logInDto): Promise<User> {
    const { email, password } = userInput;
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (
      user &&
      (await this.validatePassword(password, user.salt, user.password))
    ) {
      return user;
    } else {
      throw new UnauthorizedException(
        'メールアドレスとパスワードが一致しません',
      );
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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
    const following = false;

    let returnData;
    if (user.profile_image === null) {
      console.log('in null');
      returnData = {
        name: user.name,
        id: user.id,
        display_id: user.display_id,
        email: user.email,
        introduction: user.introduction,
        followers_num: followers_num,
        following_num: following_num,
        following: following,
      };
    } else {
      returnData = {
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
    }
    return returnData;
  }
}
