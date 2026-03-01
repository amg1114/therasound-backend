import { SongProcessingService } from '@modules/songs/application/services';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { AcrCloudMusicService } from '@modules/songs/infrastructure/services/acr-cloud';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import pLimit from 'p-limit';

@Injectable()
export class UpdateArtistsDetails {
  private readonly logger = new Logger(UpdateArtistsDetails.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly externalMusicService: AcrCloudMusicService,
    private readonly songProcessingService: SongProcessingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute() {
    const limit = pLimit(1000);
    const batchSize = 500;
    let processed = 0;
    let skip = 0;

    while (true) {
      // Traer en lotes en lugar de findAll
      const songs = await this.songRepository.findPaginated(skip, batchSize);
      if (songs.length === 0) break;

      await Promise.all(
        songs.map((song) =>
          limit(async () => {
            if (song.artists && song.artists.length > 0) {
              this.logger.log(
                `Skipping song ${song.title} (ID: ${song.id}) - already has artist details`,
              );
              this.eventEmitter.emit('song.created', song);
              return; // Skip if artists details already exist
            }

            try {
              const details = await this.externalMusicService.fetchSongDetails(
                song.spotifyId,
              );

              if (!details) {
                this.logger.error(
                  `Spotify details not found for song ID: ${song.id}`,
                );
                return; // Skip if Spotify details are not found
              }

              const artistsDetails = await Promise.all(
                details.artists.map((artistDetails) =>
                  this.songProcessingService.processArtistDetails(
                    artistDetails,
                  ),
                ),
              );

              song.artists = artistsDetails;
              await this.songRepository.save(song);
              this.eventEmitter.emit('song.created', song);
              processed++;
            } catch (error) {
              if (error instanceof NotFoundException) {
                this.logger.warn(
                  `Spotify details not found for song ID: ${song.id}, skipping...`,
                );
                return; // Skip if Spotify details are not found
              }

              throw error; // Re-throw other errors
            }
          }),
        ),
      );

      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s

      this.logger.log(`Processed ${processed} songs...`);
      skip += batchSize;
    }

    this.logger.log(`Done. Total: ${processed}`);
  }
}
