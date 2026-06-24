export interface GroupedCallLogContact {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  business_name: string;
  designation: string;
  email: string;
  alternate_number: string;
  contact_type: string;
  products: {
    product: { id: number; name: string };
    contact_status: {
      id: number;
      name: string;
      color_code: string;
      is_hide: boolean;
      is_unassigned: boolean;
    } | null;
    note: {
      id: number;
      description: string;
      reminder_datetime: string;
      user_id: number;
      created_by: { id: number; firstname: string; lastname: string };
    } | null;
  }[];
  call_logs: {
    id: number;
    mobile: string;
    start_call_at: string;
    duration: string;
    status: string;
    type: string;
    recording_url: string;
    contact_id: number;
    user_id: number;
    latitude: number;
    longitude: number;
    created_at: Date;
  } | null;
}
