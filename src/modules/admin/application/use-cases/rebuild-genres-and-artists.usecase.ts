import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import {
  GENRE_REPOSITORY,
  type IGenreRepository,
} from '@modules/genres/domain/repositories/genre-repository.interface';
import {
  ARTIST_REPOSITORY,
  type ArtistRepository,
} from '@modules/artists/domain/repositories/artist.repository.interface';
import { GenreEntity } from '@modules/genres/domain/entities/genre.entity';
import { ArtistEntity } from '@modules/artists/domain/entities';
import { Inject, Injectable, Logger } from '@nestjs/common';
import pLimit from 'p-limit';

export interface RebuildResult {
  genresProcessed: number;
  genresCreated: number;
  genresUpdated: number;
  artistsProcessed: number;
  artistsCreated: number;
  artistsUpdated: number;
  totalSongsProcessed: number;
}

@Injectable()
export class RebuildGenresAndArtistsUseCase {
  private readonly logger = new Logger(RebuildGenresAndArtistsUseCase.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepository: IGenreRepository,
    @Inject(ARTIST_REPOSITORY)
    private readonly artistRepository: ArtistRepository,
  ) {}

  async execute(): Promise<RebuildResult> {
    const limit = pLimit(20);
    const batchSize = 500;
    let totalSongsProcessed = 0;
    let skip = 0;

    // Maps to track genres and artists: key = normalized name, value = { original name, song count }
    const genresMap = new Map<
      string,
      { originalName: string; count: number }
    >();
    const artistsMap = new Map<
      string,
      { originalName: string; count: number }
    >();

    this.logger.log('Starting rebuild of genres and artists...');

    // Phase 1: Extract all genres and artists from songs
    while (true) {
      const songs = await this.songRepository.findPaginated(skip, batchSize);
      if (songs.length === 0) break;

      await Promise.all(
        songs.map(() =>
          limit(async () => {
            // Process genres
            if (songs) {
              for (const song of songs) {
                totalSongsProcessed++;

                // Extract genres
                if (song.genres && Array.isArray(song.genres)) {
                  for (const genre of song.genres) {
                    if (typeof genre === 'string' && genre.trim()) {
                      const normalized = genre.toLowerCase().trim();
                      const current = genresMap.get(normalized) || {
                        originalName: genre,
                        count: 0,
                      };
                      genresMap.set(normalized, {
                        originalName: genre,
                        count: current.count + 1,
                      });
                    }
                  }
                }

                // Extract artists
                if (song.artists && Array.isArray(song.artists)) {
                  for (const artist of song.artists) {
                    if (artist.name && artist.name.trim()) {
                      const normalized = artist.name.toLowerCase().trim();
                      const current = artistsMap.get(normalized) || {
                        originalName: artist.name,
                        count: 0,
                      };
                      artistsMap.set(normalized, {
                        originalName: artist.name,
                        count: current.count + 1,
                      });
                    }
                  }
                }
              }
            }
            return 'ok';
          }),
        ),
      );

      this.logger.log(
        `Processed ${totalSongsProcessed} songs, extracted ${genresMap.size} genres and ${artistsMap.size} artists...`,
      );
      skip += batchSize;
    }

    this.logger.log(
      `Total songs processed: ${totalSongsProcessed}. Extracted ${genresMap.size} unique genres and ${artistsMap.size} unique artists.`,
    );

    // Phase 2: Create or update genres
    let genresCreated = 0;
    let genresUpdated = 0;

    for (const [normalizedName, { originalName, count }] of genresMap) {
      await limit(async () => {
        try {
          // Try to find existing genre (case-insensitive by querying with lowercase)
          const existing =
            await this.genreRepository.findByName(normalizedName);

          if (existing) {
            // Update existing genre
            existing.songsCount = count;
            await this.genreRepository.save(existing);
            genresUpdated++;
            this.logger.debug(
              `Updated genre: ${originalName} (count: ${count})`,
            );
          } else {
            // Create new genre
            const newGenre = new GenreEntity();
            newGenre.name = normalizedName;
            newGenre.songsCount = count;
            await this.genreRepository.create(newGenre);
            genresCreated++;
            this.logger.debug(
              `Created genre: ${originalName} (count: ${count})`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error processing genre "${originalName}": ${error.message}`,
          );
        }
      });
    }

    this.logger.log(
      `Genres: created ${genresCreated}, updated ${genresUpdated}`,
    );

    // Phase 3: Create or update artists
    let artistsCreated = 0;
    let artistsUpdated = 0;

    for (const [normalizedName, { originalName, count }] of artistsMap) {
      await limit(async () => {
        try {
          // Try to find existing artist (case-insensitive by querying with lowercase)
          const existing =
            await this.artistRepository.findByName(normalizedName);

          if (existing) {
            // Update existing artist
            existing.songsCount = count;
            await this.artistRepository.save(existing);
            artistsUpdated++;
            this.logger.debug(
              `Updated artist: ${originalName} (count: ${count})`,
            );
          } else {
            // Create new artist
            const artistProps = ArtistEntity.create({
              name: normalizedName,
              songsCount: count,
            });
            await this.artistRepository.create(artistProps);
            artistsCreated++;
            this.logger.debug(
              `Created artist: ${originalName} (count: ${count})`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error processing artist "${originalName}": ${error.message}`,
          );
        }
      });
    }

    this.logger.log(
      `Artists: created ${artistsCreated}, updated ${artistsUpdated}`,
    );

    const result: RebuildResult = {
      genresProcessed: genresMap.size,
      genresCreated,
      genresUpdated,
      artistsProcessed: artistsMap.size,
      artistsCreated,
      artistsUpdated,
      totalSongsProcessed,
    };

    this.logger.log(`Rebuild completed: ${JSON.stringify(result)}`);
    return result;
  }
}
