import { PlaylistEntity } from '../entities/playlist.entity';

export const PLAYLIST_REPOSITORY = 'PLAYLIST_REPOSITORY';

export interface IPlaylistRepository {
  create(playlist: Partial<PlaylistEntity>): Promise<PlaylistEntity>;

  findById(id: string): Promise<PlaylistEntity | null>;

  findByUserId(userId: string): Promise<PlaylistEntity[]>;

  findLastByUserIdAndEmotion(
    userId: string,
    emotion: string,
  ): Promise<PlaylistEntity | null>;

  update(playlist: PlaylistEntity): Promise<PlaylistEntity>;

  delete(id: string): Promise<void>;
}
