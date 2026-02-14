import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';

export interface PlaylistProps {
  id: string;
  userId: string;
  songs: SongEntity[];
  createdAt: Date;
  emotion: EmotionVO;
  durationMs: number;
}

export type CreatePlaylistProps = Omit<PlaylistProps, 'id' | 'createdAt'>;

export class PlaylistEntity implements PlaylistProps {
  id: string;
  userId: string;
  songs: SongEntity[];
  emotion: EmotionVO;
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
