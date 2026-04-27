import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PickerConfigService {
  constructor(private configService: ConfigService) {}

  getApiKey(): string {
    return this.configService.get<string>('GOOGLE_API_KEY') || '';
  }

  getClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
  }
}
