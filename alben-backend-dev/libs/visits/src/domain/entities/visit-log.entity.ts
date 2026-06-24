export class VisitLog {
  constructor(
    public readonly id: number,
    public readonly photo: string | null,
    public readonly remark: string | null,
    public readonly datetime: Date | null,
    public readonly visitTypeId: number | null,
    public readonly contactId: number,
    public readonly productId: number | null,
    public readonly userId: number | null,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly createdAt: Date,
    public readonly changeRequestLocationStatus?: string | null,
    public readonly approvedRejectedRemark?: string | null,
    public readonly changeRequestLocationUserRemark?: string | null,
    public readonly visitType?: {
      id: number;
      name: string;
      color_code: string | null;
    } | null,
    public readonly contact?: {
      id: number;
      mobile: string;
      firstname: string;
      lastname: string;
    } | null,
  ) {}
}
