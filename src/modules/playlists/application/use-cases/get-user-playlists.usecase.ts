import { Inject, Injectable } from '@nestjs/common';
import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';

@Injectable()
export class GetUserPlaylistsUseCase {
  constructor(
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  /**
   * Retrieves all playlists for a specific user
   * @param userId - The user ID
   * @returns Array of playlist entities
   */
  async execute(userId: string): Promise<PlaylistEntity[]> {
    return this.playlistRepository.findByUserId(userId);
  }
}
