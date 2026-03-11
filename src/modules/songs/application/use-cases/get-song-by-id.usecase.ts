import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';

@Injectable()
export class GetSongByIdUseCase {
  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  /**
   * Retrieves a song by its ID
   * @param id - The song ID
   * @returns Song entity
   */
  async execute(id: string): Promise<SongEntity> {
    const song = await this.songRepository.findById(id);

    if (!song) {
      throw new NotFoundException(`Canción con ID ${id} no encontrada`);
    }

    return song;
  }
}
