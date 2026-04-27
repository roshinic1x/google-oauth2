import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { StorageService, TokenData } from '../storage/storage.service';

@Injectable()
export class GoogleAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
  ) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '';
    this.redirectUri =
      this.configService.get<string>('GOOGLE_REDIRECT_URI') || '';

    // Load scopes from environment or use defaults
    const scopesEnv = this.configService.get<string>('GOOGLE_SCOPES');
    this.scopes = scopesEnv
      ? scopesEnv.split(',').map((s) => s.trim())
      : [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/documents.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.activity.readonly',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ];
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('Generated OAuth URL:', authUrl);
    return authUrl;
  }

  async exchangeCodeForTokens(code: string): Promise<TokenData> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    // Log the full response from Google to debug
    console.log('Full Google OAuth Response:', JSON.stringify(response.data, null, 2));

    const tokens = response.data as TokenData;
    this.storageService.saveTokens(tokens);
    return tokens;
  }

  async refreshAccessToken(): Promise<TokenData> {
    const currentTokens = this.storageService.getTokens();
    if (!currentTokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: currentTokens.refresh_token,
        grant_type: 'refresh_token',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const newTokens: TokenData = {
      ...(response.data as Partial<TokenData>),
      refresh_token: currentTokens.refresh_token,
    } as TokenData;

    this.storageService.saveTokens(newTokens);
    return newTokens;
  }

  async getValidAccessToken(): Promise<string> {
    if (this.storageService.isTokenExpired()) {
      const tokens = await this.refreshAccessToken();
      return tokens.access_token;
    }

    const tokens = this.storageService.getTokens();
    if (!tokens) {
      throw new Error('No tokens available. Please authenticate first.');
    }
    return tokens.access_token;
  }
}
