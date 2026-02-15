import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { ISeedTrack } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { IKeyAudioFeatures } from '@modules/songs/domain/value-objects/audio-features.vo';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { SongResponseDto } from '@modules/songs/presentation/dto/responses/song-response.dto';
import { BadRequestException } from '@nestjs/common';
import { SongEntityORM } from '../orm/entities/song-entity.orm';

export class SongMapper {
  /**
   * Extracts Spotify ID from a Spotify URL
   * @param url - Spotify URL (e.g., https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp)
   * @returns Spotify ID or null if not found
   */
  static extractSpotifyId(url: string): string | null {
    if (!url) return null;

    // Match Spotify track URLs
    const matchUrl = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (matchUrl && matchUrl[1]) {
      return matchUrl[1];
    }

    const matchUri = url.match(/spotify:track:([a-zA-Z0-9]+)/);
    if (matchUri && matchUri[1]) {
      return matchUri[1];
    }

    return null;
  }

  static toEntity(raw: SongEntityORM): SongEntity {
    const song = new SongEntity();

    song.id = raw._id.toString();
    song.spotifyId = raw.spotifyId;
    song.title = raw.title;
    song.artist = raw.artist;
    song.emotion = EmotionVO.create(raw.emotion);
    song.durationMs = raw.durationMs;
    song.spotifyUrl = raw.spotifyUrl;
    song.genres = raw.genres;
    song.imageUrl = raw.imageUrl;
    song.releaseDate = raw.releaseDate;
    song.audioFeatures = raw.audioFeatures;
    song.emotionConfidence = raw.emotionConfidence;
    song.emotionProbabilities = raw.emotionProbabilities;
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
      const id = this.extractSpotifyId(entity.spotifyUrl);
      if (!id)
        throw new BadRequestException('URL de Spotify inválida proporcionada');
      spotifyId = id;
    }

    return {
      spotifyId: spotifyId || entity.spotifyId,
      title: entity.title,
      artist: entity.artist,
      emotion: entity.emotion?.getValue(),
      durationMs: entity.durationMs,
      spotifyUrl: entity.spotifyUrl,
      genres: entity.genres,
      imageUrl: entity.imageUrl,
      releaseDate: entity.releaseDate,
      audioFeatures: entity.audioFeatures,
      emotionConfidence: entity.emotionConfidence,
      emotionProbabilities: entity.emotionProbabilities,
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
    response.artist = entity.artist;
    response.emotion = entity.emotion.getValue();
    response.durationMs = entity.durationMs;
    response.spotifyUrl = entity.spotifyUrl;
    response.genres = entity.genres;
    response.imageUrl = entity.imageUrl;
    response.releaseDate = entity.releaseDate;
    response.audioFeatures = entity.audioFeatures;
    response.emotionConfidence = entity.emotionConfidence;
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
      artist: entity.artist,
      emotion: entity.emotion.getValue(),
      genres: entity.genres,
      imageUrl: entity.imageUrl,
    };
  }

  static songFeaturesToKeyFeatures(entity: SongEntity): IKeyAudioFeatures {
    return {
      acousticness: entity.audioFeatures.acousticness,
      danceability: entity.audioFeatures.danceability,
      energy: entity.audioFeatures.energy,
      instrumentalness: entity.audioFeatures.instrumentalness,
      liveness: entity.audioFeatures.liveness,
      loudness: entity.audioFeatures.loudness,
      speechiness: entity.audioFeatures.speechiness,
      tempo: entity.audioFeatures.tempo,
      valence: entity.audioFeatures.valence,
    };
  }

  static audioFeaturesToKeyFeatures(
    entity: SongEntity['audioFeatures'],
  ): IKeyAudioFeatures {
    return {
      acousticness: entity.acousticness,
      danceability: entity.danceability,
      energy: entity.energy,
      instrumentalness: entity.instrumentalness,
      liveness: entity.liveness,
      loudness: entity.loudness,
      speechiness: entity.speechiness,
      tempo: entity.tempo,
      valence: entity.valence,
    };
  }

  static seedAudioFeaturesToKeyFeatures(entity: ISeedTrack): IKeyAudioFeatures {
    return {
      acousticness: entity.acousticness,
      danceability: entity.danceability,
      energy: entity.energy,
      instrumentalness: entity.instrumentalness,
      liveness: entity.liveness,
      loudness: entity.loudness,
      speechiness: entity.speechiness,
      tempo: entity.tempo,
      valence: entity.valence,
    };
  }

  static seedAudioFeaturesToSongFeatures(
    entity: ISeedTrack,
  ): SongEntity['audioFeatures'] {
    return {
      acousticness: entity.acousticness,
      danceability: entity.danceability,
      energy: entity.energy,
      instrumentalness: entity.instrumentalness,
      liveness: entity.liveness,
      loudness: entity.loudness,
      speechiness: entity.speechiness,
      tempo: entity.tempo,
      valence: entity.valence,
    };
  }
}
