export interface ContactStatusObj {
  id: number;
  name: string;
  color_code: string;
}

export interface ContactObj {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  business_name: string | null;
  designation: string | null;
  email: string | null;
  contact_type: string;
}

export interface ProductObj {
  id: number;
  name: string;
}

export interface CreatedByObj {
  id: number;
  firstname: string;
  lastname: string;
}

export interface NoteContactRaw {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  businessName: string | null;
  designation: string | null;
  email: string | null;
  contactType: string;
  productContacts?: {
    contactStatus?: { id: number; name: string; colorCode: string };
  }[];
}
