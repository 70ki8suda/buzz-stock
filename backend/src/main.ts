import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://buzz-stock.vercel.app',
      'https://buzz-stock.com',
    ],
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept,Authorization',
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT);
}
bootstrap();
