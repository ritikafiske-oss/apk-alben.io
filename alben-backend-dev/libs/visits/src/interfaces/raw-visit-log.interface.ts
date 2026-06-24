export interface RawVisitLog {
  id: string;
  photo: string | null;
  remark: string | null;
  datetime: Date | null;
  visitTypeId: string | null;
  contactId: string;
  productId: string | null;
  userId: string | null;
  latitude: string;
  longitude: string;
  createdAt: Date;
  change_request_location_status?: string | null;
  approved_rejected_remark?: string | null;
  change_request_location_user_remark?: string | null;
  vt_id: string;
  vt_name: string;
  vt_colorCode: string | null;
  c_id: string;
  c_mobile: string;
  c_firstname: string;
  c_lastname: string;
}
