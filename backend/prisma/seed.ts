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
  //*user IDは1 start
  for (let i = 1; i < 6; i++) {
    await prisma.user.create({
      data: {
        email: `test${i}@gmail.com`,
        name: `test${i}`,
        display_id: `test${i}`,
        password: password,
        salt: salt,
      },
    });
  }
  //*user IDは1 start
  for (let i = 1; i < 6; i++) {
    for (let j = 0; j < 15; j++) {
      await prisma.tweet.create({
        data: {
          user: {
            connect: {
              id: i,
            },
          },
          content: `user${i} post${j}`,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
