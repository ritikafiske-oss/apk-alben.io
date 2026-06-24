export class VisitType {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly colorCode: string | null,
    public readonly isNextFollowup: boolean,
  ) {}
}
