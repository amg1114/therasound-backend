export interface SoundchartsArtistDto {
  uuid: string;
  slug: string;
  name: string;
  appUrl: string;
  imageUrl: string;
}

export interface SoundchartsIsrcDto {
  value: string;
  countryCode: string;
  countryName: string;
}

export interface SoundchartsGenreDto {
  root: string;
  sub: string[];
}

export interface SoundchartsLabelDto {
  name: string;
  type: string;
}

export interface SoundchartsAudioDto {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  timeSignature: number;
  valence: number;
}

export interface SoundchartsSongObjectDto {
  uuid: string;
  name: string;
  isrc: SoundchartsIsrcDto;
  iswcs: string[];
  creditName: string;
  artists: SoundchartsArtistDto[];
  releaseDate: string;
  copyright: string;
  appUrl: string;
  imageUrl: string;
  duration: number;
  explicit: boolean;
  genres: SoundchartsGenreDto[];
  composers: string[];
  producers: string[];
  labels: SoundchartsLabelDto[];
  audio: SoundchartsAudioDto;
  languageCode: string;
  distributor: string;
}

export interface SoundchartsErrorDto {
  key: string;
  code: number;
  message: string;
}

export interface SoundchartsResponseDto {
  type: string;
  object: SoundchartsSongObjectDto;
  errors: SoundchartsErrorDto[];
}
