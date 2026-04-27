import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleModule } from './google/google.module';
import { PickerModule } from './picker/picker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GoogleModule,
    PickerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
