export interface RawProductContactRow {
  id: string;
  product_id: string;
  is_service: string;
  contact_id: string;
  contact_status_id: string;
  latitude: string | null;
  longitude: string | null;
  p_id: string;
  p_name: string | null;
  cs_id: string;
  cs_name: string | null;
  cs_color_code: string | null;
}
