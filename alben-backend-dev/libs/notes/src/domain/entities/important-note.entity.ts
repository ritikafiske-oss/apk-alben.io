export class ImportantNote {
  constructor(
    public readonly id: number,
    public readonly noteId: number,
    public readonly userId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
