import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import type { MulterFile } from '../interfaces/multer-file.interface';
import { DynamicLoggerService } from '@libs/common';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly usePathStyleEndpoint: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: DynamicLoggerService,
  ) {
    const accountId = this.configService.get<string>(
      'CLOUDFLARE_R2_ACCOUNT_ID',
    ); // Hardcoded as per user request/env
    const accessKeyId = this.configService.get<string>(
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.configService.get<string>(
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    );
    this.bucketName = this.configService.get<string>(
      'CLOUDFLARE_R2_BUCKET',
      'alben-dev',
    );
    const endpoint = this.configService.get<string>(
      'CLOUDFLARE_R2_ENDPOINT',
      `https://${accountId}.r2.cloudflarestorage.com`,
    );
    this.usePathStyleEndpoint =
      this.configService.get<string>(
        'CLOUDFLARE_R2_USE_PATH_STYLE_ENDPOINT',
        'true',
      ) === 'true';

    if (!accessKeyId || !secretAccessKey || !accountId) {
      this.logger.warn(
        'R2 credentials (Access Key, Secret Key, or Account ID) missing. StorageService will fail to upload.',
        'exceptions',
      );
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      forcePathStyle: this.usePathStyleEndpoint, // Crucial for R2 in some configurations
    });
  }

  async uploadFile(file: MulterFile, directory: string = ''): Promise<string> {
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const key = directory ? `${directory}/${filename}` : filename;

    const commandInput: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(commandInput));

      const publicUrlBase = this.configService.get<string>(
        'CLOUDFLARE_R2_PUBLIC_URL',
      );
      let fullUrl = `${this.bucketName}/${key}`;

      if (publicUrlBase) {
        // Ensure no double slashes
        const baseUrl = publicUrlBase.replace(/\/$/, '');
        fullUrl = `${baseUrl}/${key}`;
      }

      this.logger.log(
        `[StorageService] Uploaded file successfully: Bucket: ${this.bucketName}, Key: ${key} -> FULL PUBLIC URL: ${fullUrl}`,
      );

      return fullUrl;
    } catch (error) {
      this.logger.error(
        `Error uploading to R2: ${(error as Error).message}`,
        (error as Error).stack,
        'exceptions',
      );
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }
}
