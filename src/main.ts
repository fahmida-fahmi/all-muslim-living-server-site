import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS - এটা add করুন
  app.enableCors({
    origin: '*', // আপনার frontend URL
    credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // // Global prefix
  // app.setGlobalPrefix('api');

  const port = 4000;
  await app.listen(port);

  console.log(`🚀 Server running on the: http://localhost:${port}`);
}
bootstrap();