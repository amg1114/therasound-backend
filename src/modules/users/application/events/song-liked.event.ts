export class SongLikedEvent {
  constructor(
    public readonly songId: string,
    public readonly action: 'add' | 'remove',
  ) {}
}
