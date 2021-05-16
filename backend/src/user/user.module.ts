import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
