import { ApiProperty } from '@nestjs/swagger';

export class VisitTypeDetailResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Visit' })
  name: string;

  @ApiProperty({ example: '#FF5733', nullable: true })
  color_code: string | null;
}

export class LatestNoteDetailResponse {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 'Discussed product features.' })
  description: string;

  @ApiProperty({ example: '2026-04-09T10:00:00Z' })
  created_at: Date;
}

export class VisitLogProductDetailResponse {
  @ApiProperty({ example: 54 })
  id: number;

  @ApiProperty({ example: 'Product Name' })
  name: string;

  @ApiProperty({ type: VisitTypeDetailResponse, nullable: true })
  visit_type: VisitTypeDetailResponse | null;

  @ApiProperty({ type: LatestNoteDetailResponse, nullable: true })
  latest_note: LatestNoteDetailResponse | null;
}

export class GetVisitLogDetailsResponseData {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/photo.jpg', nullable: true })
  photo: string | null;

  @ApiProperty({ example: 'Great visit!', nullable: true })
  remark: string | null;

  @ApiProperty({ example: '2026-04-09T10:00:00Z', nullable: true })
  datetime: Date | null;

  @ApiProperty({ example: 21.1458 })
  latitude: number;

  @ApiProperty({ example: 79.0882 })
  longitude: number;

  @ApiProperty({ example: 7, nullable: true })
  visit_type_id: number | null;

  @ApiProperty({ example: 101 })
  contact_id: number;

  @ApiProperty({ type: [VisitLogProductDetailResponse] })
  products: VisitLogProductDetailResponse[];
}
