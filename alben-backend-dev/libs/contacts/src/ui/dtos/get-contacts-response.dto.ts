import { ApiProperty } from '@nestjs/swagger';

class ContactStatusDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Interested' })
  name: string;

  @ApiProperty({ example: '#00FF00' })
  color_code: string;

  @ApiProperty({ example: false })
  is_hide: boolean;

  @ApiProperty({ example: false })
  is_unassigned: boolean;
}

class ProductDto {
  @ApiProperty({ example: 63 })
  id: number;

  @ApiProperty({ example: 'Product Name' })
  name: string;
}

export class ContactProductDto {
  @ApiProperty({ type: ProductDto })
  product: ProductDto;

  @ApiProperty({ example: false })
  is_service: boolean;

  @ApiProperty({ type: ContactStatusDto, nullable: true })
  contact_status: ContactStatusDto | null;

  @ApiProperty({ example: 1 })
  is_manualdial: number;

  @ApiProperty({ example: 0 })
  is_autodial: number;

  @ApiProperty({ example: 1 })
  attempts: number;

  @ApiProperty({ example: 'Latest note content', nullable: true })
  latest_note: string | null;
}

export class ContactRecordDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'John', nullable: true })
  firstname: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastname: string | null;

  @ApiProperty({ example: '1234567890', nullable: true })
  mobile: string | null;

  @ApiProperty({ example: 'Doe Corp', nullable: true })
  business_name: string | null;

  @ApiProperty({ example: 'Manager', nullable: true })
  designation: string | null;

  @ApiProperty({ example: 'john@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: '0987654321', nullable: true })
  alternate_number: string | null;

  @ApiProperty({ example: 'client' })
  contact_type: string;

  @ApiProperty({ example: '2023-10-27T10:00:00Z', nullable: true })
  schedule_at: string | null;

  @ApiProperty({ example: '2023-10-27T10:00:00Z', nullable: true })
  created_at: string | null;

  @ApiProperty({ type: [ContactProductDto] })
  products: ContactProductDto[];

  @ApiProperty({ type: String, example: null, nullable: true })
  note: string | null;

  @ApiProperty({ example: 'call', nullable: true })
  type: string | null;

  @ApiProperty({ example: 'notes', nullable: true })
  data_from: string | null;

  @ApiProperty({ example: 123, nullable: true })
  call_or_note_id: number | null;
}

export class GetContactsResponseDto {
  @ApiProperty({ example: 'manualdial' })
  dial: string;

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 10 })
  total_pages: number;

  @ApiProperty({ example: 2000 })
  total_items: number;

  @ApiProperty({ type: [ContactRecordDto] })
  records: ContactRecordDto[];
}
