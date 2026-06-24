export class SurpriseVisit {
  constructor(
    public readonly id: number,
    public readonly questionId: number,
    public readonly question: string,
    public readonly userId: number,
    public readonly companyId: number,
    public readonly answer: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
