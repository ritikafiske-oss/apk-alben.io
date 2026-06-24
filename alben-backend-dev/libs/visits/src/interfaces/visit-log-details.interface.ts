export interface VisitTypeDetail {
  id: number;
  name: string;
  color_code: string | null;
}

export interface LatestNoteDetail {
  id: number;
  description: string;
  created_at: Date;
}

export interface VisitLogProductDetail {
  id: number;
  name: string;
  visit_type: VisitTypeDetail | null;
  latest_note: LatestNoteDetail | null;
}

export interface VisitLogDetails {
  id: number;
  photo: string | null;
  remark: string | null;
  datetime: Date | null;
  latitude: number;
  longitude: number;
  visit_type_id: number | null;
  contact_id: number;
  change_request_location_status: string | null;
  approved_rejected_remark: string | null;
  change_request_location_user_remark: string | null;
  products: VisitLogProductDetail[];
}

export interface RawNoteQueryResult {
  id: string | number;
  description: string;
  created_at: Date;
}
