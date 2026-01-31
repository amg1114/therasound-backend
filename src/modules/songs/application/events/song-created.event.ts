export class SongCreatedEvent {
  constructor(
    public readonly songId: string,
    public readonly genres: string[],
  ) {}
}
