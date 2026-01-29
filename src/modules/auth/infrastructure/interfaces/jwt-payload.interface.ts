export interface IJwtPayload {
  sub: string;
  email: string;
  name: string;
  userPreferences: {
    likedSongs: string[];
    dislikedSongs: string[];
    dislikedGenres: string[];
    dislikedArtists: string[];
  };
  iat?: number;
  exp?: number;
}
