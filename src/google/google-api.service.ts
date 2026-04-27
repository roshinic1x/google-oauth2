import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class GoogleApiService {
  constructor(private googleAuthService: GoogleAuthService) {}

  async getFileMetadata(fileId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        params: {
          fields: 'id,name,mimeType,modifiedTime,version',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async getDocContent(docId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      `https://docs.googleapis.com/v1/documents/${docId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async getDocRevisions(docId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${docId}/revisions`,
      {
        params: {
          fields: '*', // Get all fields including exportLinks
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    
    // Sort by modifiedTime descending (newest first)
    const revisions = response.data.revisions || [];
    revisions.sort((a: any, b: any) => 
      new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    );
    
    return {
      ...response.data,
      revisions,
      currentRevision: revisions[0], // First one is the current version
    };
  }


  async getDocRevisionContent(docId: string, revisionId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();

    // Get revision metadata with ALL fields
    const revisionResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${docId}/revisions/${revisionId}`,
      {
        params: {
          fields: '*', // IMPORTANT: Get all fields including exportLinks
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const revision = revisionResponse.data;
    console.log('Revision metadata:', JSON.stringify(revision, null, 2));
    
    let content: string | null = null;
    let htmlContent: string | null = null;

    // Use exportLinks from revision metadata
    if (revision.exportLinks) {
      console.log('Export links available:', Object.keys(revision.exportLinks));
      
      // Try plain text export
      if (revision.exportLinks['text/plain']) {
        try {
          const textResponse = await axios.get(
            revision.exportLinks['text/plain'],
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          content = textResponse.data;
          console.log(`Successfully fetched text content for revision ${revisionId}`);
        } catch (error) {
          console.error('Failed to fetch text via exportLinks:', error.message);
        }
      }

      // Try HTML export
      if (revision.exportLinks['text/html']) {
        try {
          const htmlResponse = await axios.get(
            revision.exportLinks['text/html'],
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          htmlContent = htmlResponse.data;
          console.log(`Successfully fetched HTML content for revision ${revisionId}`);
        } catch (error) {
          console.error('Failed to fetch HTML via exportLinks:', error.message);
        }
      }
    } else {
      console.log('No exportLinks in revision metadata');
    }

    return {
      revisionId,
      docId,
      modifiedTime: revision.modifiedTime,
      lastModifyingUser: revision.lastModifyingUser,
      keepForever: revision.keepForever,
      published: revision.published,
      exportLinks: revision.exportLinks,
      content,
      htmlContent,
      note: content || htmlContent 
        ? 'Successfully retrieved revision content via exportLinks' 
        : 'Content not available. This may be because: 1) The revision is too old, 2) Export links not available for this file type, 3) Insufficient permissions',
    };
  }

  async getDocActivity(docId: string, startDate?: Date, endDate?: Date, userEmail?: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();

    // Build the request body for Drive Activity API
    const requestBody: any = {
      itemName: `items/${docId}`,
      pageSize: 100,
    };

    // Add filter if provided
    const filters: string[] = [];
    
    if (startDate) {
      filters.push(`time >= "${startDate.toISOString()}"`);
    }
    
    if (endDate) {
      filters.push(`time <= "${endDate.toISOString()}"`);
    }

    if (filters.length > 0) {
      requestBody.filter = filters.join(' AND ');
    }

    try {
      const response = await axios.post(
        'https://driveactivity.googleapis.com/v2/activity:query',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      let activities = response.data.activities || [];

      // Filter by user email if provided
      if (userEmail) {
        activities = activities.filter((activity: any) => {
          const actors = activity.actors || [];
          return actors.some((actor: any) => 
            actor.user?.knownUser?.personName?.includes(userEmail) ||
            actor.user?.knownUser?.emailAddress === userEmail
          );
        });
      }

      return {
        docId,
        totalActivities: activities.length,
        activities: activities.map((activity: any) => ({
          timestamp: activity.timestamp,
          actors: activity.actors?.map((actor: any) => ({
            type: actor.user ? 'user' : actor.administrator ? 'administrator' : 'unknown',
            email: actor.user?.knownUser?.personName || 'Unknown',
            isDeleted: actor.user?.deletedUser || false,
          })),
          actions: activity.primaryActionDetail,
          targets: activity.targets?.map((target: any) => ({
            driveItem: target.driveItem?.name,
            mimeType: target.driveItem?.mimeType,
          })),
        })),
        filters: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          userEmail,
        },
        note: 'Drive Activity API provides detailed user actions. This shows WHO did WHAT and WHEN, but not the specific content changes.',
      };
    } catch (error) {
      if (error.response?.status === 403) {
        return {
          error: 'Drive Activity API not enabled or insufficient permissions',
          message: 'You need to enable the Drive Activity API in Google Cloud Console and add the scope: https://www.googleapis.com/auth/drive.activity.readonly',
          docId,
        };
      }
      throw error;
    }
  }

  async getSheetActivity(sheetId: string, startDate?: Date, endDate?: Date, userEmail?: string) {
    // Same implementation as getDocActivity since it uses Drive Activity API
    return this.getDocActivity(sheetId, startDate, endDate, userEmail);
  }

  async getFilePermissions(fileId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        params: {
          fields: '*', // Get all permission fields
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return {
      fileId,
      permissions: response.data.permissions || [],
      totalPermissions: response.data.permissions?.length || 0,
    };
  }

  async getSheetContent(sheetId: string, range: string = 'Sheet1') {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async getSpreadsheetMetadata(sheetId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      {
        params: {
          fields: 'spreadsheetId,properties,sheets(properties)',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async getSheetRevisions(sheetId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${sheetId}/revisions`,
      {
        params: {
          fields: '*', // Get all fields including exportLinks
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    
    // Sort by modifiedTime descending (newest first)
    const revisions = response.data.revisions || [];
    revisions.sort((a: any, b: any) => 
      new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    );
    
    return {
      ...response.data,
      revisions,
      currentRevision: revisions[0], // First one is the current version
    };
  }


  async getSheetRevisionContent(sheetId: string, revisionId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();

    // Get revision metadata with ALL fields
    const revisionResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${sheetId}/revisions/${revisionId}`,
      {
        params: {
          fields: '*', // IMPORTANT: Get all fields including exportLinks
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const revision = revisionResponse.data;
    console.log('Sheet Revision metadata:', JSON.stringify(revision, null, 2));
    
    let csvContent: string | null = null;
    let excelContent: string | null = null;

    // Method 1: Use exportLinks from revision metadata
    if (revision.exportLinks) {
      console.log('Export links available:', Object.keys(revision.exportLinks));
      
      // Try CSV export
      if (revision.exportLinks['text/csv']) {
        try {
          const csvResponse = await axios.get(
            revision.exportLinks['text/csv'],
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          csvContent = csvResponse.data;
          console.log(`Successfully fetched CSV for revision ${revisionId}`);
        } catch (error) {
          console.error('Failed to fetch CSV via exportLinks:', error.message);
        }
      }

      // Try Excel export
      if (revision.exportLinks['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']) {
        try {
          const excelResponse = await axios.get(
            revision.exportLinks['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              responseType: 'arraybuffer',
            },
          );
          excelContent = Buffer.from(excelResponse.data).toString('base64');
          console.log(`Successfully fetched Excel for revision ${revisionId}`);
        } catch (error) {
          console.error('Failed to fetch Excel via exportLinks:', error.message);
        }
      }
    }

    // Method 2: Fallback to export endpoint with revisionId
    if (!csvContent) {
      try {
        console.log(`Trying export endpoint with revisionId ${revisionId}...`);
        const csvExportUrl = `https://www.googleapis.com/drive/v3/files/${sheetId}/export`;
        const csvResponse = await axios.get(csvExportUrl, {
          params: {
            mimeType: 'text/csv',
            revisionId: revisionId,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        csvContent = csvResponse.data;
        console.log(`Successfully exported revision ${revisionId} as CSV via export endpoint`);
      } catch (error) {
        console.error('Export endpoint failed:', error.response?.status, error.message);
      }
    }

    return {
      revisionId,
      sheetId,
      modifiedTime: revision.modifiedTime,
      lastModifyingUser: revision.lastModifyingUser,
      keepForever: revision.keepForever,
      published: revision.published,
      exportLinks: revision.exportLinks,
      csvContent,
      excelContent: excelContent ? `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelContent}` : null,
      note: csvContent || excelContent 
        ? 'Successfully retrieved revision content' 
        : 'Content not available. Check server logs for details.',
    };
  }


  async listFiles(pageSize: number = 10) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      'https://www.googleapis.com/drive/v3/files',
      {
        params: {
          pageSize,
          fields: 'files(id,name,mimeType,modifiedTime)',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async listFilesInFolder(folderId: string) {
    const accessToken = await this.googleAuthService.getValidAccessToken();
    const response = await axios.get(
      'https://www.googleapis.com/drive/v3/files',
      {
        params: {
          q: `'${folderId}' in parents`,
          fields: 'files(id,name,mimeType,modifiedTime,parents)',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }
}
