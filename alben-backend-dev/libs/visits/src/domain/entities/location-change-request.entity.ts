export class LocationChangeRequest {
  constructor(
    public readonly id: number,
    public readonly contactId: number,
    public readonly previousVisitLogId: number | null,
    public readonly visitLogId: number,
    public readonly userId: number,
    public readonly userRemark: string | null,
    public readonly approvedStatus:
      | 'approved'
      | 'rejected'
      | 'cancelled'
      | 'pending'
      | 'reverted',
    public readonly approvedBy: number | null,
    public readonly approvedRemark: string | null,
    public readonly approvedDatetime: Date | null,
    public readonly updatedBy: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
