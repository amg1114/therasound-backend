export interface ReccoBeatsArtistDto {
  id: string;
  name: string;
  href: string;
}

export interface ReccoBeatsTrackDto {
  id: string;
  trackTitle: string;
  artists: ReccoBeatsArtistDto[];
  durationMs: number;
  isrc: string;
  ean: string;
  upc: string;
  href: string;
  availableCountries: string;
  popularity: number;
}

export interface ReccoBeatsResponseDto {
  content: ReccoBeatsTrackDto[];
}
