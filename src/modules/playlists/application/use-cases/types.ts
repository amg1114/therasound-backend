import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';

export interface GeneratePlaylistResult {
  playlist: PlaylistEntity;
  sessionId: string;
}
