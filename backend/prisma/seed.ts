import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import * as bcrypt from 'bcrypt';

const hashPassword = async (
  password: string,
  salt: string,
): Promise<string> => {
  return bcrypt.hash(password, salt);
};

async function main() {
  console.log('seeding');
  const salt = await bcrypt.genSalt();
  const password = await hashPassword('password', salt);
  await prisma.user.create({
    data: {
      email: 'test1@gmail.com',
      name: 'test1',
      display_id: 'test1',
      password: password,
      salt: salt,
      tweets: {
        create: [
          {
            content: 'test1 post1',
          },
          {
            content: 'test1 post2',
          },
        ],
      },
    },
  });

  await prisma.tweet.create({
    data: {
      user: {
        connect: {
          id: 1,
        },
      },
      content: 'user1 post3',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
