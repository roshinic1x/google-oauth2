import { Module } from '@nestjs/common';
import { PickerController, PickerViewController } from './picker.controller';
import { PickerService } from './picker.service';
import { PickerConfigService } from './picker-config.service';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [PickerController, PickerViewController],
  providers: [PickerService, PickerConfigService, StorageService],
  exports: [PickerService],
})
export class PickerModule {}
