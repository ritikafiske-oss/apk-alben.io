export interface RawVisitLogRow {
  id: string;
  photo: string | null;
  remark: string | null;
  datetime: string | null;
  visit_type_id: string | null;
  contact_id: string;
  vt_name: string | null;
  vt_color_code: string | null;
  change_request_location_status: string | null;
  approved_rejected_remark: string | null;
  change_request_location_user_remark: string | null;
  created_at?: Date | string | null;
  user_id?: string | number | null;
  product_id?: string | number | null;
  latitude?: string | number;
  longitude?: string | number;
  primary_latitude?: string | number;
  primary_longitude?: string | number;
  is_regularized?: string | number | boolean;
}
