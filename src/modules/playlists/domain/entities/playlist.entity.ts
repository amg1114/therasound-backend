import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';

export interface PlaylistProps {
  id: string;
  userId: string;
  songs: SongEntity[];
  createdAt: Date;
  emotion: SongEmotionVO;
  durationMs: number;
}

export type CreatePlaylistProps = Omit<PlaylistProps, 'id' | 'createdAt'>;

export class PlaylistEntity implements PlaylistProps {
  id: string;
  userId: string;
  songs: SongEntity[];
  emotion: SongEmotionVO;
  createdAt: Date;
  durationMs: number;

  private constructor(props: PlaylistProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.songs = props.songs;
    this.emotion = props.emotion;
    this.createdAt = props.createdAt;
    this.durationMs = props.durationMs;
  }

  static create(props: CreatePlaylistProps): Partial<PlaylistEntity> {
    return {
      ...props,
    };
  }

  static reconstruct(props: PlaylistProps): PlaylistEntity {
    return new PlaylistEntity(props);
  }
}
