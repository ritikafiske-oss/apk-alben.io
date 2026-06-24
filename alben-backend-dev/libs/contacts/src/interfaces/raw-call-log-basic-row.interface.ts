export interface RawCallLogBasicRow {
  id: number;
  mobile: string;
  start_call_at: Date;
  duration: string;
  status: string;
  type: string;
  recording_url: string;
  contact_id: number;
  user_id: number;
  latitude: number | string | null;
  longitude: number | string | null;
  created_at: Date;
}
