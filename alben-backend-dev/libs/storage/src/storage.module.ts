import { Module } from '@nestjs/common';
import { StorageService } from './application/storage.service';
import { UploadFilesUseCase } from './application/upload-files.usecase';
import { StorageController } from './ui/storage.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [StorageService, UploadFilesUseCase],
  exports: [StorageService],
})
export class StorageModule {}
