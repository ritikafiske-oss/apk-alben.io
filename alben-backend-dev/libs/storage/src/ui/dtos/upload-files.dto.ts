import { IsNotEmpty, IsString } from 'class-validator';

export class UploadFilesDto {
  @IsString()
  @IsNotEmpty()
  company_id: string;
}
