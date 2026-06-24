export interface RawNoteRow {
  id: string | number;
  description: string | null;
  reminder_datetime: Date | string | null;
  contact_id?: string | number;
  product_id?: string | number | null;
  user_id: string | number;
  for_note?: string | null;
  is_reminder_sent?: string | number;
  is_important?: string | number;
  call_log_id?: string | number | null;
  visit_log_id?: string | number | null;
  is_done?: string | number | boolean;
  created_at?: Date | string | null;
  u_id?: string | null;
  u_firstname?: string | null;
  u_lastname?: string | null;
}
