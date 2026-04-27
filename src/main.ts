import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Google Docs & Sheets Integration API')
    .setDescription(
      'API for OAuth integration with Google Drive, Docs, and Sheets',
    )
    .setVersion('1.0')
    .addTag('Drive', 'Google Drive API endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 5000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 5000}`,
  );
  console.log(
    `Swagger API Docs: http://localhost:${process.env.PORT ?? 5000}/api-docs`,
  );
  console.log(
    `Start OAuth flow at: http://localhost:${process.env.PORT ?? 5000}/auth/google`,
  );
  console.log(
    `Open Picker at: http://localhost:${process.env.PORT ?? 5000}/picker`,
  );
}
bootstrap();
