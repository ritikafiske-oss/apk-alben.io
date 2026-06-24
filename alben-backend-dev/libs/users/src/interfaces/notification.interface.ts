import { Notification } from '../domain/notification.entity';

export interface MappedNotification extends Notification {
  company: {
    id: number;
    business_name: string;
    business_logo: string | null;
  } | null;
  note: {
    id: number;
    description: string;
    reminder_datetime: Date | null;
    created_at: Date;
    for_note: string;
  } | null;
  product: { id: number; name: string } | null;
  contact: {
    id: number;
    firstname: string | null;
    lastname: string | null;
    mobile: string;
    business_name: string | null;
    designation: string | null;
    email: string | null;
    contact_type: string;
  } | null;
  contact_status: {
    id: number;
    name: string;
    color_code: string | null;
  } | null;
}
