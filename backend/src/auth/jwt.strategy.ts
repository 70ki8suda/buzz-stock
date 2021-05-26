import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { PrismaService } from '../prisma.service';
import { JwtPayload } from './jwt-payload.interface';
import { User } from '.prisma/client';

// const cookieExtractor = function (req) {
//   let token = null;
//   if (req && req.cookies) {
//     token = req.cookies['jwt'];
//   }
//   return token;
// };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      //jwtFromRequest: cookieExtractor,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
