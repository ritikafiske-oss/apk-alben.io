import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';
import type { MulterFile } from '../interfaces/multer-file.interface';

export interface UploadedFileResult {
  filename: string;
  url: string;
}

@Injectable()
export class UploadFilesUseCase {
  constructor(private readonly storageService: StorageService) {}

  async execute(
    companyId: string,
    files: MulterFile[],
  ): Promise<UploadedFileResult[]> {
    const directory = `${companyId}/attachments`;
    const results: UploadedFileResult[] = [];

    for (const file of files) {
      const url = await this.storageService.uploadFile(file, directory);
      results.push({ filename: file.originalname, url });
    }

    return results;
  }
}
