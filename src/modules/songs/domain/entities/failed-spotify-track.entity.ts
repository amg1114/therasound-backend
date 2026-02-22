// failed-spotify-track.entity.ts
export class FailedSpotifyTrackEntity {
  constructor(
    public readonly spotifyId: string,
    public readonly reason: 'not_found' | 'emotion_error' | 'details_error',
    public readonly createdAt: Date = new Date(),
  ) {}
}
