export interface NoteObject {
  id: number;
  description: string;
  reminder_datetime: string | Date;
  contact_id: number;
  product_id: number | null;
  user_id: number;
  for_note: string;
  is_reminder_sent: number;
  created_at: string | Date;
  created_by: {
    id: number;
    firstname: string;
    lastname: string;
  } | null;
}
