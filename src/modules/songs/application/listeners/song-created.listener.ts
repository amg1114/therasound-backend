import {
  ARTIST_REPOSITORY,
  type ArtistRepository,
} from '@modules/artists/domain/repositories';
import {
  GENRE_REPOSITORY,
  type IGenreRepository,
} from '@modules/genres/domain/repositories/genre-repository.interface';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SongCreatedListener {
  private readonly logger = new Logger(SongCreatedListener.name);

  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepository: IGenreRepository,
    @Inject(ARTIST_REPOSITORY)
    private readonly artistRepository: ArtistRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  @OnEvent('song.created')
  async handleSongCreated(song: SongEntity) {
    this.logger.log(`Song created event received for song ${song.id} `);

    for (const genreName of song.genres) {
      try {
        let genre = await this.genreRepository.findByName(genreName);

        if (!genre) {
          genre = await this.genreRepository.create({
            name: genreName,
            songsCount: 0,
          });
        }

        genre.songsCount =
          (await this.songRepository.countByGenre(genreName)) || 0;

        this.logger.log(
          `Updated songs count for genre ${genre.name}: ${genre.songsCount}`,
        );

        await this.genreRepository.save(genre);
      } catch (error) {
        this.logger.error(
          `Error processing genre ${genreName}: ${error.message}`,
        );
      }
    }

    for (const artistSummary of song.artists) {
      try {
        const artist = await this.artistRepository.findById(artistSummary.id);

        if (!artist) {
          continue;
        }

        artist.songsCount =
          (await this.songRepository.countByArtistId(artist.id)) || 0;
        this.logger.log(
          `Updated songs count for artist ${artist.name}: ${artist.songsCount}`,
        );

        await this.artistRepository.save(artist);
      } catch (error) {
        this.logger.error(
          `Error processing artist ${artistSummary.name}: ${error.message}`,
        );
      }
    }
  }
}
