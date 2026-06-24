export interface ActionItem {
  id: string;
  time: string | null;
  note: string | null;
  type: string | null;
  data_from: string | null;
  call_or_note_id: number | null;
  actionProducts: { productId: number; isService: boolean }[];
}

export interface GroupedAction extends ActionItem {
  productId: number;
  isService: boolean;
  note_description: string | null;
}
