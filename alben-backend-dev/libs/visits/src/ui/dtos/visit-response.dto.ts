import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from '@libs/common';

export class VisitTypeResponseData {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Next Followup' })
  name: string;

  @ApiProperty({
    example: 1,
    description: '1 if it is a next followup, 0 otherwise',
  })
  is_next_followup: number;

  @ApiProperty({ example: '#FF5733' })
  color_code: string;
}

export class VisitLogRecordResponseData {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/uploads/photo.jpg' })
  photo: string;

  @ApiProperty({ example: 'Customer was busy' })
  remark: string;

  @ApiProperty({ example: '2026-03-20 12:00:00' })
  datetime: Date;

  @ApiProperty({ example: 21.1458 })
  latitude: number;

  @ApiProperty({ example: 79.0882 })
  longitude: number;

  @ApiProperty({ example: 7 })
  visit_type_id: number;

  @ApiProperty({ example: 101 })
  contact_id: number;

  @ApiProperty({ example: 54 })
  product_id: number;

  @ApiProperty({ example: 10 })
  user_id: number;

  @ApiProperty({ example: '2026-03-20T10:00:00Z' })
  created_at: Date;

  @ApiProperty({ example: 'pending' })
  change_request_location_status: string;

  @ApiProperty({ example: 'Location updated.' })
  approved_rejected_remark: string;

  @ApiProperty({ example: 'User updated the location manually.' })
  change_request_location_user_remark: string;

  @ApiProperty({ type: () => Object })
  visitType: Record<string, unknown>;

  @ApiProperty({ type: () => Object })
  contact: Record<string, unknown>;
}

export class VisitLogsPaginationData {
  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 5 })
  total_pages: number;

  @ApiProperty({ example: 100 })
  total_items: number;

  @ApiProperty({ type: [VisitLogRecordResponseData] })
  records: VisitLogRecordResponseData[];
}

export class GetVisitTypesResponse extends ApiResponse<
  VisitTypeResponseData[]
> {
  @ApiProperty({ type: [VisitTypeResponseData] })
  declare data: VisitTypeResponseData[];
}

export class GetVisitLogsResponse extends ApiResponse<VisitLogsPaginationData> {
  @ApiProperty({ type: VisitLogsPaginationData })
  declare data: VisitLogsPaginationData;
}

export class SaveVisitLogResponse extends ApiResponse<null> {
  @ApiProperty({ example: null })
  declare data: null;
}
