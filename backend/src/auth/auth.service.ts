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

interface SingUpInput {
  name: string;
  email: string;
  display_id: string;
  password: string;
}

interface SignInInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async signUp(userInput: SingUpInput): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedData: Prisma.UserCreateInput = { ...userInput, salt };

    hashedData.password = await this.hashPassword(
      userInput.password,
      hashedData.salt,
    );
    try {
      await this.prisma.user.create({
        data: { ...hashedData },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (error.code === 'P2002') {
          throw new ConflictException('Email or ID already exists');
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  }

  async signIn(
    userInput: SignInInput,
  ): Promise<{ accessToken: string; userId: number }> {
    const user = await this.validateUserPassword(userInput);
    const user_email = user.email;
    const user_id = user.id;
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = { user_email };
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

  async validateUserPassword(userInput: SignInInput): Promise<User> {
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
      throw new UnauthorizedException('invalid credentials');
    }
  }
}
