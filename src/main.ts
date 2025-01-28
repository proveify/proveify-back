import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_IS_PROD, APP_PORT } from '../config/envs';
import { LogLevel, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logLevel: LogLevel[] = ['error', 'warn', 'fatal', 'log'];

  if (!APP_IS_PROD) {
    logLevel.push('debug', 'verbose');
  }

  const app = await NestFactory.create(AppModule, { logger: logLevel });
  app.enableVersioning({ type: VersioningType.URI });
  await app.listen(APP_PORT);
}

bootstrap();
