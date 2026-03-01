import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';

export interface ContentPreferences {
  songs: SongSummaryVO[]; // Song summary value object
  genres: string[]; // Genre unique name
  artists: string[]; // Artist unique name
}

export const CONTENT_TYPES = ['songs', 'genres', 'artists'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const PREFERENCE_TYPES = ['likes', 'dislikes'] as const;
export type PreferenceType = (typeof PREFERENCE_TYPES)[number];
