import { ApiProperty } from '@nestjs/swagger';

class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Product Name' })
  name: string;
}

class ContactStatusDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'New' })
  name: string;

  @ApiProperty({ example: '#FF0000' })
  color_code: string;
}

class LocationDto {
  @ApiProperty({ example: 12.9716 })
  latitude: number;

  @ApiProperty({ example: 77.5946 })
  longitude: number;
}

class AttachmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Invoice' })
  title: string;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  url: string;

  @ApiProperty({ example: '2026-03-18T13:10:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-03-18T13:10:00.000Z' })
  updated_at: Date;
}

class ActivityLogItemDto {
  @ApiProperty({ example: 1 })
  action_id: number;

  @ApiProperty({ example: '2026-03-18 13:10:00' })
  activity_date: string;

  @ApiProperty({
    example: 'calls',
    enum: ['calls', 'visits', 'notes', 'important_notes'],
  })
  type: string;

  @ApiProperty({ example: 'Description or status message', nullable: true })
  description?: string;

  @ApiProperty({ example: '7787788894', nullable: true })
  mobile?: string;

  @ApiProperty({ example: 'incoming', nullable: true })
  call_type?: string;

  @ApiProperty({ example: 'received', nullable: true })
  status?: string;

  @ApiProperty({ example: 'Remark for visit', nullable: true })
  remark?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', nullable: true })
  photo?: string;

  @ApiProperty({ example: false, nullable: true })
  is_important?: boolean;
}

export class GetContactDetailsResponseDto {
  @ApiProperty({ example: 14220 })
  id: number;

  @ApiProperty({ example: 'John' })
  firstname: string;

  @ApiProperty({ example: 'Doe' })
  lastname: string;

  @ApiProperty({ example: '7787788894' })
  mobile: string;

  @ApiProperty({ example: 'Business Name', nullable: true })
  business_name: string | null;

  @ApiProperty({ example: 'Manager', nullable: true })
  designation: string | null;

  @ApiProperty({ type: LocationDto, nullable: true })
  primary_location: LocationDto | null;

  @ApiProperty({ example: 'john@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: '9988776655', nullable: true })
  alternate_number: string | null;

  @ApiProperty({ example: 'client', enum: ['client', 'vendor', 'colleague'] })
  contact_type: string;

  @ApiProperty({ type: ProductDto, nullable: true })
  product: ProductDto | null;

  @ApiProperty({ type: ContactStatusDto, nullable: true })
  contact_status: ContactStatusDto | null;

  @ApiProperty({ example: '2026-03-18', nullable: true })
  reminder_date: string | null;

  @ApiProperty({ example: '2026-03-18', nullable: true })
  last_contact_date: string | null;

  @ApiProperty({ type: [AttachmentDto] })
  attachments: AttachmentDto[];

  @ApiProperty({ type: [ActivityLogItemDto] })
  activity_logs: ActivityLogItemDto[];
}
