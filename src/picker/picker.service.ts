import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface PickerItem {
  id: string;
  name: string;
  mimeType: string;
  url?: string;
  iconUrl?: string;
  description?: string;
  lastEditedUtc?: number;
  parentId?: string;
}

@Injectable()
export class PickerService {
  private readonly storagePath = path.join(process.cwd(), 'storage');
  private readonly selectedItemsFile = path.join(
    this.storagePath,
    'selected-items.json',
  );

  constructor() {
    this.ensureStorageExists();
  }

  private ensureStorageExists(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async saveSelectedItems(items: PickerItem[]) {
    const timestamp = new Date().toISOString();
    const data = {
      timestamp,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        mimeType: item.mimeType,
        url: item.url,
        iconUrl: item.iconUrl,
        description: item.description,
        lastEditedUtc: item.lastEditedUtc,
        parentId: item.parentId,
      })),
    };

    fs.writeFileSync(this.selectedItemsFile, JSON.stringify(data, null, 2));

    return {
      success: true,
      message: `Saved ${items.length} items`,
      timestamp,
    };
  }

  getSelectedItems() {
    if (!fs.existsSync(this.selectedItemsFile)) {
      return { items: [], timestamp: null };
    }

    const data = fs.readFileSync(this.selectedItemsFile, 'utf-8');
    return JSON.parse(data);
  }

  clearSelectedItems() {
    if (fs.existsSync(this.selectedItemsFile)) {
      fs.unlinkSync(this.selectedItemsFile);
    }
    return { success: true, message: 'Cleared selected items' };
  }
}
