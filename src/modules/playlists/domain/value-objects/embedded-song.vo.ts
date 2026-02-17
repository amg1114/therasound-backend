export type EmbeddedSongVO = {
  id: string;
  title: string;
  artist: string;
  emotion: string;
  durationMs: number;
  spotifyUrl: string;
  genres: string[];
  imageUrl: string;
  releaseDate: Date;
};
