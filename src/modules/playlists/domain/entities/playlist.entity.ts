import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { EmbeddedSongVO } from '../value-objects/embedded-song.vo';

export interface PlaylistProps {
  id: string;
  userId: string;
  title?: string;
  songs: EmbeddedSongVO[];
  createdAt: Date;
  emotion: EmotionVO;
  durationMs: number;
}

export type CreatePlaylistProps = Omit<
  PlaylistProps,
  'id' | 'createdAt' | 'title'
>;

export class PlaylistEntity implements PlaylistProps {
  id: string;
  userId: string;
  title?: string;
  songs: EmbeddedSongVO[];
  emotion: EmotionVO;
  createdAt: Date;
  durationMs: number;

  private constructor(props: PlaylistProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
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
