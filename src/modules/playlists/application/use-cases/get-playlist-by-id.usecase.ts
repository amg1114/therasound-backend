import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';

@Injectable()
export class GetPlaylistByIdUseCase {
  constructor(
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  /**
   * Retrieves a playlist by its ID
   * @param id - The playlist ID
   * @returns Playlist entity
   */
  async execute(id: string): Promise<PlaylistEntity> {
    const playlist = await this.playlistRepository.findById(id);

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }

    return playlist;
  }
}
