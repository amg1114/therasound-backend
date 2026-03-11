import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';

export type HistorySongVO = {
  song: SongSummaryVO;
  listenedAt: Date;
  completionRate: number; // 0 to 1, how much of the song was listened to
};
