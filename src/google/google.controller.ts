import { Controller, Get, Query, Res, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { GoogleAuthService } from './google-auth.service';
import { GoogleApiService } from './google-api.service';
import {
  AuthResponseDto,
  FileMetadataDto,
  ListFilesResponseDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth/google')
export class GoogleController {
  constructor(
    private googleAuthService: GoogleAuthService,
    private googleApiService: GoogleApiService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Initiate OAuth flow' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  initiateAuth(@Res() res: Response) {
    const authUrl = this.googleAuthService.getAuthUrl();
    res.redirect(authUrl);
  }

  @Get('callback')
  @ApiOperation({ summary: 'OAuth callback handler' })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code from Google',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Authorization code not found' })
  @ApiResponse({
    status: 500,
    description: 'Failed to exchange authorization code',
  })
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not found' });
      }

      const tokens = await this.googleAuthService.exchangeCodeForTokens(code);
      res.json({
        message: 'Authentication successful',
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          scope: tokens.scope,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to exchange authorization code',
        details: error.message,
      });
    }
  }
}

@ApiTags('Drive')
@Controller('api')
export class ApiController {
  constructor(private googleApiService: GoogleApiService) {}

  @Get('files')
  @ApiTags('Drive')
  @ApiOperation({ summary: 'List files from Google Drive' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of files to return',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of files',
    type: ListFilesResponseDto,
  })
  async listFiles(@Query('pageSize') pageSize?: number) {
    try {
      const files = await this.googleApiService.listFiles(
        pageSize ? parseInt(pageSize.toString()) : 10,
      );
      return files;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('file/:fileId/metadata')
  @ApiTags('Drive')
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
  @ApiResponse({
    status: 200,
    description: 'File metadata',
    type: FileMetadataDto,
  })
  async getFileMetadata(@Param('fileId') fileId: string) {
    try {
      const metadata = await this.googleApiService.getFileMetadata(fileId);
      return metadata;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('doc/:docId')
  @ApiOperation({ summary: 'Get Google Doc content' })
  @ApiParam({ name: 'docId', description: 'Google Doc ID' })
  @ApiResponse({ status: 200, description: 'Document content' })
  async getDocContent(@Param('docId') docId: string) {
    try {
      const content = await this.googleApiService.getDocContent(docId);
      return content;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('doc/:docId/revisions')
  @ApiOperation({ summary: 'Get document revision history' })
  @ApiParam({ name: 'docId', description: 'Google Doc ID' })
  @ApiResponse({ status: 200, description: 'Document revisions' })
  async getDocRevisions(@Param('docId') docId: string) {
    try {
      const revisions = await this.googleApiService.getDocRevisions(docId);
      return revisions;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('doc/:docId/revision/:revisionId')
  @ApiOperation({ summary: 'Get specific revision content' })
  @ApiParam({ name: 'docId', description: 'Google Doc ID' })
  @ApiParam({ name: 'revisionId', description: 'Revision ID' })
  @ApiResponse({ status: 200, description: 'Revision content' })
  async getDocRevisionContent(
    @Param('docId') docId: string,
    @Param('revisionId') revisionId: string,
  ) {
    try {
      const content = await this.googleApiService.getDocRevisionContent(
        docId,
        revisionId,
      );
      return content;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('file/:fileId/permissions')
  @ApiTags('Drive')
  @ApiOperation({ summary: 'Get file permissions (who has access)' })
  @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
  @ApiResponse({ status: 200, description: 'File permissions' })
  async getFilePermissions(@Param('fileId') fileId: string) {
    try {
      const permissions = await this.googleApiService.getFilePermissions(fileId);
      return permissions;
    } catch (error) {
      return { error: error.message };
    }
  }


  @Get('doc/:docId/activity')
  @ApiOperation({ summary: 'Get document activity (who did what and when) using Drive Activity API' })
  @ApiParam({ name: 'docId', description: 'Google Doc ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO format)',
    example: '2026-04-07T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO format)',
    example: '2026-04-14T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'userEmail',
    required: false,
    description: 'Filter by user email',
    example: '36roshini@gmail.com',
  })
  @ApiResponse({ status: 200, description: 'Document activity' })
  async getDocActivity(
    @Param('docId') docId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userEmail') userEmail?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const activity = await this.googleApiService.getDocActivity(
        docId,
        start,
        end,
        userEmail,
      );
      return activity;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('sheet/:sheetId')
  @ApiOperation({ summary: 'Get Google Sheet content' })
  @ApiParam({ name: 'sheetId', description: 'Google Sheet ID' })
  @ApiQuery({
    name: 'range',
    required: false,
    description: 'Sheet name or range (e.g., "Sheet1", "Sheet3", "MySheet!A1:D10")',
    example: 'Sheet1',
  })
  @ApiResponse({ status: 200, description: 'Spreadsheet content' })
  async getSheetContent(
    @Param('sheetId') sheetId: string,
    @Query('range') range?: string,
  ) {
    try {
      const content = await this.googleApiService.getSheetContent(
        sheetId,
        range || 'Sheet1',
      );
      return content;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('sheet/:sheetId/metadata')
  @ApiOperation({ summary: 'Get spreadsheet metadata (list all sheets)' })
  @ApiParam({ name: 'sheetId', description: 'Google Sheet ID' })
  @ApiResponse({ status: 200, description: 'Spreadsheet metadata' })
  async getSpreadsheetMetadata(@Param('sheetId') sheetId: string) {
    try {
      const metadata = await this.googleApiService.getSpreadsheetMetadata(sheetId);
      return metadata;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('sheet/:sheetId/revisions')
  @ApiOperation({ summary: 'Get spreadsheet revision history' })
  @ApiParam({ name: 'sheetId', description: 'Google Sheet ID' })
  @ApiResponse({ status: 200, description: 'Spreadsheet revisions' })
  async getSheetRevisions(@Param('sheetId') sheetId: string) {
    try {
      const revisions = await this.googleApiService.getSheetRevisions(sheetId);
      return revisions;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('sheet/:sheetId/revision/:revisionId')
  @ApiOperation({ summary: 'Get specific sheet revision content (entire spreadsheet at that revision)' })
  @ApiParam({ name: 'sheetId', description: 'Google Sheet ID' })
  @ApiParam({ name: 'revisionId', description: 'Revision ID' })
  @ApiResponse({ status: 200, description: 'Revision content as CSV' })
  async getSheetRevisionContent(
    @Param('sheetId') sheetId: string,
    @Param('revisionId') revisionId: string,
  ) {
    try {
      const content = await this.googleApiService.getSheetRevisionContent(
        sheetId,
        revisionId,
      );
      return content;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('sheet/:sheetId/activity')
  @ApiOperation({ summary: 'Get spreadsheet activity (who did what and when) using Drive Activity API' })
  @ApiParam({ name: 'sheetId', description: 'Google Sheet ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO format)',
    example: '2026-04-07T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO format)',
    example: '2026-04-14T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'userEmail',
    required: false,
    description: 'Filter by user email',
    example: '36roshini@gmail.com',
  })
  @ApiResponse({ status: 200, description: 'Spreadsheet activity' })
  async getSheetActivity(
    @Param('sheetId') sheetId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userEmail') userEmail?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const activity = await this.googleApiService.getSheetActivity(
        sheetId,
        start,
        end,
        userEmail,
      );
      return activity;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('folder/:folderId/files')
  @ApiOperation({ summary: 'List files in a folder' })
  @ApiParam({ name: 'folderId', description: 'Google Drive folder ID' })
  @ApiResponse({
    status: 200,
    description: 'List of files in folder',
    type: ListFilesResponseDto,
  })
  async listFilesInFolder(@Param('folderId') folderId: string) {
    try {
      const files = await this.googleApiService.listFilesInFolder(folderId);
      return files;
    } catch (error) {
      return { error: error.message };
    }
  }

}
