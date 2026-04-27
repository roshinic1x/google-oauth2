export * from './picker.dto';

// Re-export auth status from picker
export class AuthStatusDto {
  authenticated: boolean;
  accessToken?: string;
}

export class PickerConfigDto {
  apiKey: string;
  clientId: string;
}

export class SaveSelectedItemsDto {
  items: any[];
}

export class SaveSelectedItemsResponseDto {
  success: boolean;
  message: string;
  timestamp: string;
}

export class SelectedItemsResponseDto {
  timestamp: string;
  items: any[];
}
