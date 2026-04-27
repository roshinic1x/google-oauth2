import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({ example: 'ya29.a0AfH6SMC...' })
  access_token: string;

  @ApiProperty({ example: 3599 })
  expires_in: number;

  @ApiProperty({
    example:
      'https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/spreadsheets.readonly',
  })
  scope: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'Authentication successful' })
  message: string;

  @ApiProperty({ type: TokensDto })
  tokens: TokensDto;
}

export class AuthStatusDto {
  @ApiProperty({ example: true })
  authenticated: boolean;

  @ApiProperty({ example: 'ya29.a0AfH6SMC...', required: false })
  accessToken?: string;
}
