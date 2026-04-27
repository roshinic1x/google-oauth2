import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleApiService } from './google-api.service';
import { GoogleController, ApiController } from './google.controller';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [GoogleController, ApiController],
  providers: [GoogleAuthService, GoogleApiService, StorageService],
  exports: [GoogleAuthService, GoogleApiService],
})
export class GoogleModule {}
