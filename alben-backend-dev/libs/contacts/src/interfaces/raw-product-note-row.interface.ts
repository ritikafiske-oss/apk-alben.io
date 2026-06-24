export interface RawProductNoteRow {
  contact_id: number;
  product_id: number;
  contact_status_id: number | null;
  product_name: string | null;
  status_name: string | null;
  status_color_code: string | null;
  status_is_hide: number | boolean | null;
  status_is_unassigned: number | boolean | null;
  note_id: number | null;
  note_description: string | null;
  note_reminder_datetime: string | Date | null;
  note_user_id: number | null;
  nu_firstname: string | null;
  nu_lastname: string | null;
}
