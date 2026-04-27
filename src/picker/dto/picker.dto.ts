import { ApiProperty } from '@nestjs/swagger';

export class PickerItemDto {
  @ApiProperty({ example: '1abc123...' })
  id: string;

  @ApiProperty({ example: 'My Document' })
  name: string;

  @ApiProperty({ example: 'application/vnd.google-apps.document' })
  mimeType: string;

  @ApiProperty({
    example: 'https://docs.google.com/document/d/...',
    required: false,
  })
  url?: string;

  @ApiProperty({ example: 'https://...', required: false })
  iconUrl?: string;

  @ApiProperty({ example: 'Document description', required: false })
  description?: string;

  @ApiProperty({ example: 1234567890, required: false })
  lastEditedUtc?: number;

  @ApiProperty({ example: 'folder_id', required: false })
  parentId?: string;
}

export class SaveSelectedItemsDto {
  @ApiProperty({ type: [PickerItemDto] })
  items: PickerItemDto[];
}

export class SaveSelectedItemsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Saved 1 items' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;
}

export class PickerConfigDto {
  @ApiProperty({ example: 'AIzaSyD...' })
  apiKey: string;

  @ApiProperty({ example: '123456789.apps.googleusercontent.com' })
  clientId: string;
}

export class SelectedItemsResponseDto {
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ type: [PickerItemDto] })
  items: PickerItemDto[];
}
