import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';

export type HistorySongVO = {
  song: SongSummaryVO;
  listenedAt: Date;
};
