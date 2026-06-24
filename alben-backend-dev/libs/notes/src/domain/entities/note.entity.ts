export class Note {
  constructor(
    public readonly id: number,
    public readonly description: string,
    public readonly reminderDatetime: Date | null,
    public readonly contactId: number,
    public readonly callLogId: number,
    public readonly visitLogId: number,
    public readonly productId: number | null,
    public readonly userId: number,
    public readonly forNote: 'visit' | 'others',
    public readonly isReminderSent: boolean,
    public readonly isDone: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
