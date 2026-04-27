import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { PickerService } from './picker.service';
import { PickerConfigService } from './picker-config.service';
import { StorageService } from '../storage/storage.service';
import {
  AuthStatusDto,
  PickerConfigDto,
  SaveSelectedItemsDto,
  SaveSelectedItemsResponseDto,
  SelectedItemsResponseDto,
} from './dto';

@ApiTags('Picker')
@Controller('api')
export class PickerController {
  constructor(
    private pickerService: PickerService,
    private pickerConfigService: PickerConfigService,
    private storageService: StorageService,
  ) {}

  @Get('auth/status')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({
    status: 200,
    description: 'Authentication status',
    type: AuthStatusDto,
  })
  getAuthStatus() {
    const tokens = this.storageService.getTokens();
    if (!tokens || this.storageService.isTokenExpired()) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      accessToken: tokens.access_token,
    };
  }

  @Get('picker/config')
  @ApiOperation({ summary: 'Get picker configuration' })
  @ApiResponse({
    status: 200,
    description: 'Picker configuration',
    type: PickerConfigDto,
  })
  getPickerConfig() {
    return {
      apiKey: this.pickerConfigService.getApiKey(),
      clientId: this.pickerConfigService.getClientId(),
    };
  }

  @Post('picker/selected')
  @ApiOperation({ summary: 'Save selected items from picker' })
  @ApiResponse({
    status: 200,
    description: 'Items saved successfully',
    type: SaveSelectedItemsResponseDto,
  })
  async handleSelectedItems(@Body() body: SaveSelectedItemsDto) {
    const result = await this.pickerService.saveSelectedItems(body.items);
    return result;
  }

  @Get('picker/items')
  @ApiOperation({ summary: 'Get previously selected items' })
  @ApiResponse({
    status: 200,
    description: 'Selected items',
    type: SelectedItemsResponseDto,
  })
  getSelectedItems() {
    return this.pickerService.getSelectedItems();
  }
}

@Controller()
export class PickerViewController {
  @Get('picker')
  @ApiExcludeEndpoint()
  servePicker(@Res() res: Response) {
    res.sendFile('index.html', { root: './public' });
  }
}
