export interface AcrCloudResponseDto {
  data: Datum[];
}

export interface Datum {
  name: string;
  disc_number: number;
  track_number: number;
  isrc: string;
  genres: string[];
  duration_ms: number;
  release_date?: string;
  artists: DatumArtist[];
  album: DatumAlbum;
  external_metadata: ExternalMetadata;
  type: string;
  works: Work[];
}

export interface DatumAlbum {
  track_count: number;
  upc: string;
  release_date: string;
  label: string;
  cover: string;
  covers: Covers;
}

export interface Covers {
  small: string;
  medium: string;
  large: string;
}

export interface DatumArtist {
  name: string;
}

export interface ExternalMetadata {
  applemusic: Applemusic[];
  deezer: Deezer[];
  youtube: Youtube[];
  spotify: Applemusic[];
}

export interface Applemusic {
  id: string;
  link: string;
  preview: string;
  artists: ApplemusicArtist[];
  album: ApplemusicAlbum;
}

export interface ApplemusicAlbum {
  id: string;
  cover: string;
}

export interface ApplemusicArtist {
  id: string;
}

export interface Deezer {
  id: string;
  link: string;
  artists: DeezerArtist[];
  album: DeezerAlbum;
}

export interface DeezerAlbum {
  id: number;
  cover: string;
}

export interface DeezerArtist {
  id: number;
}

export interface Youtube {
  id: string;
  link: string;
  artists: ArtistClass[];
  album: ArtistClass;
}

export interface ArtistClass {
  id: string;
  link: string;
}

export interface Work {
  iswc: string;
  contributors: Contributor[];
  name: string;
}

export interface Contributor {
  name: string;
  ipi: number;
  roles: Role[];
}

export enum Role {
  Composer = 'Composer',
  Publisher = 'Publisher',
}
