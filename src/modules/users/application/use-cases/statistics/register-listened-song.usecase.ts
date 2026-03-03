import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongMapper } from '@modules/songs/infrastructure/mappers';
import {
  type IUserStatisticsRepository,
  USER_PREFERENCES_REPOSITORY,
  USER_STATISTICS_REPOSITORY,
  type UserPreferencesRepository,
} from '@modules/users/domain/repositories';
import { HistorySongVO } from '@modules/users/domain/value-objects/history-song.vo';
import { RegisterListenedSongDto } from '@modules/users/presentation/dto/requests/statistics/register-listened-song.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class RegisterListenedSongUseCase {
  constructor(
    @Inject(USER_STATISTICS_REPOSITORY)
    private readonly statisticsRepository: IUserStatisticsRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: UserPreferencesRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  async execute(userId: string, dto: RegisterListenedSongDto): Promise<void> {
    const { songId, completionRate } = dto;

    if (completionRate <= 0) {
      throw new BadRequestException('Completion rate must be greater than 0.');
    }

    const [statistics, preferences, song] = await Promise.all([
      this.statisticsRepository.findByUserId(userId),
      this.preferencesRepository.findByUserId(userId),
      this.songRepository.findById(songId),
    ]);

    if (!statistics) {
      throw new NotFoundException(
        `Statistics for user with ID ${userId} not found.`,
      );
    }

    if (!preferences) {
      throw new NotFoundException(
        `Preferences for user with ID ${userId} not found.`,
      );
    }

    if (!song) {
      throw new NotFoundException(`Song with ID ${songId} not found.`);
    }

    const historyEntry = preferences.listenedHistory.find(
      (entry) => entry.song.id === songId,
    );

    if (historyEntry) {
      historyEntry.listenedAt = new Date();
      historyEntry.completionRate = completionRate;
    } else {
      const songSummary = SongMapper.toSummaryVO(song);

      preferences.listenedHistory.push({
        song: songSummary,
        listenedAt: new Date(),
        completionRate,
      } as HistorySongVO);
    }

    preferences.listenedHistory = preferences.listenedHistory.sort(
      (a, b) => b.listenedAt.getTime() - a.listenedAt.getTime(),
    );

    if (completionRate > 0) {
      statistics.totalSongsListened += 1;
      statistics.totalListeningTimeMs += song.durationMs * completionRate;
      statistics.updateStreak();
    }

    if (completionRate < 0.3) {
      song.skipCount += 1;
    }

    song.playCount += 1;
    song.averageCompletionRate =
      (song.averageCompletionRate * (song.playCount - 1) + completionRate) /
      song.playCount;

    await Promise.all([
      this.preferencesRepository.save(preferences),
      this.statisticsRepository.update(statistics),
      this.songRepository.save(song),
    ]);
  }
}
