export class ExcludedContact {
  constructor(
    public readonly id: number,
    public readonly name: string | null,
    public readonly mobile: string,
    public readonly userId: number,
    public readonly type: 'personal' | 'vendor' | 'others',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
