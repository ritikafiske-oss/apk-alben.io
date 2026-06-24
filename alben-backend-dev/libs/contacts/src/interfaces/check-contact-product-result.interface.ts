export interface CheckContactProductResult {
  id: number;
  name: string;
  status: {
    id: number;
    name: string;
    color_code: string;
  } | null;
  latest_note: string | null;
}
