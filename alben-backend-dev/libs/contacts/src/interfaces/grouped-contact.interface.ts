import { ContactRecordDto } from '../ui/dtos/get-contacts-response.dto';

export interface GroupedContact {
  id: number;
  firstname: string | null;
  lastname: string | null;
  mobile: string | null;
  business_name: string | null;
  designation: string | null;
  email: string | null;
  alternate_number: string | null;
  contact_type: string;
  schedule_at: string | null;
  created_at: string | null;
  products: ContactRecordDto['products'];
  note: string | null;
  type: string | null;
  data_from: string | null;
  call_or_note_id: number | null;
}
