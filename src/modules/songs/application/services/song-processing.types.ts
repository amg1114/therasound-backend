export interface SongExternalDetails {
  title: string;
  artistSpotifyIds: string[];
  genres: string[];
  releaseDate: Date;
  imageUrl: string;
  durationMs: number;
  spotifyUrl: string;
}

export interface ArtistExternalDetails {
  name: string;
  spotifyId: string;
  imageUrl?: string;
}
