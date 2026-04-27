import { ApiProperty } from '@nestjs/swagger';

export class FileMetadataDto {
  @ApiProperty({ example: '1abc123...' })
  id: string;

  @ApiProperty({ example: 'My Document' })
  name: string;

  @ApiProperty({ example: 'application/vnd.google-apps.document' })
  mimeType: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  modifiedTime: string;

  @ApiProperty({ example: '12345', required: false })
  version?: string;

  @ApiProperty({ example: ['parent_folder_id'], required: false })
  parents?: string[];
}

export class ListFilesResponseDto {
  @ApiProperty({ type: [FileMetadataDto] })
  files: FileMetadataDto[];
}

export class FolderItemDto {
  @ApiProperty({ example: 'document', enum: ['document', 'spreadsheet', 'folder'] })
  type: string;

  @ApiProperty({ example: '1abc123...' })
  id: string;

  @ApiProperty({ example: 'My Document' })
  name: string;

  @ApiProperty({ required: false })
  content?: any;

  @ApiProperty({ type: [FolderItemDto], required: false })
  contents?: FolderItemDto[];
}

export class ProcessFolderResponseDto {
  @ApiProperty({ example: '1abc123...' })
  folderId: string;

  @ApiProperty({ type: [FolderItemDto] })
  results: FolderItemDto[];

  @ApiProperty({ example: 5 })
  totalItems: number;
}
