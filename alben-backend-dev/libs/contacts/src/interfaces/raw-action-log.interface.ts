export interface RawActionLog {
  contact_id: string | number;
  timestamp: string | Date;
  event_type: string;
  status: string | null;
  duration: string | null;
  recording_url: string | null;
  note_description: string | null;
  product_id: string | number | null;
  is_service: number | null;
  action_id: string | number;
  action_products_agg?: string;
}
