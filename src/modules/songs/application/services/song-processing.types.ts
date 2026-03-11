export interface SongExternalDetails {
  title: string;
  artists: ArtistExternalDetails[];
  genres: string[];
  releaseDate: Date;
  imageUrl: string;
  durationMs: number;
  spotifyUrl: string;
}

export interface ArtistExternalDetails {
  name: string;
  spotifyId?: string;
  imageUrl?: string;
}
