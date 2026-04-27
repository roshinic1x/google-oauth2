import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  expires_at: number;
  scope: string;
  token_type: string;
}

@Injectable()
export class StorageService {
  private readonly storagePath = path.join(process.cwd(), 'storage');
  private readonly tokenFile = path.join(this.storagePath, 'tokens.json');

  constructor() {
    this.ensureStorageExists();
  }

  private ensureStorageExists(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  saveTokens(tokens: TokenData): void {
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    const tokenData: TokenData = {
      ...tokens,
      expires_at: expiresAt,
    };
    fs.writeFileSync(this.tokenFile, JSON.stringify(tokenData, null, 2));
  }

  getTokens(): TokenData | null {
    if (!fs.existsSync(this.tokenFile)) {
      return null;
    }
    const data = fs.readFileSync(this.tokenFile, 'utf-8');
    return JSON.parse(data);
  }

  isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;
    return Date.now() >= tokens.expires_at;
  }

  clearTokens(): void {
    if (fs.existsSync(this.tokenFile)) {
      fs.unlinkSync(this.tokenFile);
    }
  }
}
