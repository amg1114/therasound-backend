import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { EmbeddedSongVO } from '@modules/playlists/domain/value-objects/embedded-song.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { SongResponseDto } from '@modules/songs/presentation/dto/responses/song-response.dto';
import { BadRequestException } from '@nestjs/common';
import { extractSpotifyId } from 'src/utils/extractSpotifyID';
import { SongEntityORM } from '../orm/entities/song-entity.orm';

export class SongMapper {
  static toEntity(raw: SongEntityORM): SongEntity {
    const song = new SongEntity();

    song.id = raw._id.toString();
    song.spotifyId = raw.spotifyId;
    song.title = raw.title;
    song.artists = raw.artists;
    song.emotion = EmotionVO.create(raw.emotion);
    song.durationMs = raw.durationMs;
    song.spotifyUrl = raw.spotifyUrl;
    song.genres = raw.genres;
    song.imageUrl = raw.imageUrl;
    song.releaseDate = raw.releaseDate;
    song.audioFeatures = raw.audioFeatures;
    song.emotionProbabilities = raw.emotionProbabilities;
    song.emotionDistances = raw.emotionDistances;
    song.reccobeatsId = raw.reccobeatsId;
    song.likesCount = raw.likesCount;
    song.skipCount = raw.skipCount;
    song.playCount = raw.playCount;
    song.averageCompletionRate = raw.averageCompletionRate;

    return song;
  }

  static toORM(entity: Partial<SongEntity>): Partial<SongEntityORM> {
    // If spotifyId is not provided but spotifyUrl is, extract it from the URL
    let spotifyId = entity.spotifyId;
    if (!spotifyId && entity.spotifyUrl) {
      const id = extractSpotifyId(entity.spotifyUrl);
      if (!id)
        throw new BadRequestException('URL de Spotify inválida proporcionada');
      spotifyId = id;
    }

    return {
      spotifyId: spotifyId || entity.spotifyId,
      title: entity.title,
      artists: entity.artists,
      emotion: entity.emotion?.getValue(),
      durationMs: entity.durationMs,
      spotifyUrl: entity.spotifyUrl,
      genres: entity.genres,
      imageUrl: entity.imageUrl,
      releaseDate: entity.releaseDate,
      audioFeatures: entity.audioFeatures,
      emotionProbabilities: entity.emotionProbabilities,
      emotionDistances: entity.emotionDistances,
      reccobeatsId: entity.reccobeatsId,
      likesCount: entity.likesCount,
      skipCount: entity.skipCount,
      playCount: entity.playCount,
      averageCompletionRate: entity.averageCompletionRate,
    };
  }

  static toResponseDto(entity: SongEntity): SongResponseDto {
    const response = new SongResponseDto();

    response.id = entity.id;
    response.spotifyId = entity.spotifyId;
    response.title = entity.title;
    response.emotion = entity.emotion.getValue();
    response.durationMs = entity.durationMs;
    response.spotifyUrl = entity.spotifyUrl;
    response.genres = entity.genres;
    response.imageUrl = entity.imageUrl;
    response.releaseDate = entity.releaseDate;
    response.audioFeatures = entity.audioFeatures;
    response.emotionProbabilities = entity.emotionProbabilities;
    response.reccobeatsId = entity.reccobeatsId;
    response.likesCount = entity.likesCount;

    return response;
  }

  static toSummaryVO(entity: SongEntity): SongSummaryVO {
    return {
      id: entity.id,
      spotifyId: entity.spotifyId,
      title: entity.title,
      artists: entity.artists,
      emotion: entity.emotion.getValue(),
      genres: entity.genres,
      imageUrl: entity.imageUrl,
    };
  }

  static toEmbeddedSongVO(entity: SongEntity): EmbeddedSongVO {
    return {
      id: entity.id,
      spotifyId: entity.spotifyId,
      title: entity.title,
      artists: entity.artists,
      emotion: entity.emotion.getValue(),
      emotionProbabilities: entity.emotionProbabilities,
      durationMs: entity.durationMs,
      spotifyUrl: entity.spotifyUrl,
      genres: entity.genres,
      imageUrl: entity.imageUrl,
      releaseDate: entity.releaseDate,
    };
  }
}
