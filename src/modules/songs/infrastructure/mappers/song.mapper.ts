import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongEntityORM } from '../orm/entities/song-entity.orm';
import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { BadRequestException } from '@nestjs/common';
import { SongResponseDto } from '@modules/songs/presentation/dto/responses/song-response.dto';

export class SongMapper {
  /**
   * Extracts Spotify ID from a Spotify URL
   * @param url - Spotify URL (e.g., https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp)
   * @returns Spotify ID or null if not found
   */
  static extractSpotifyId(url: string): string | null {
    if (!url) return null;

    // Match Spotify track URLs
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  static toEntity(raw: SongEntityORM): SongEntity {
    const song = new SongEntity();

    song.id = raw._id.toString();
    song.spotifyId = raw.spotifyId;
    song.title = raw.title;
    song.artist = raw.artist;
    song.emotion = SongEmotionVO.create(raw.emotion);
    song.durationMs = raw.durationMs;
    song.spotifyUrl = raw.spotifyUrl;
    song.genres = raw.genres;
    song.imageUrl = raw.imageUrl;
    song.releaseDate = raw.releaseDate;
    song.audioFeatures = raw.audioFeatures;
    song.emotionConfidence = raw.emotionConfidence;
    song.emotionProbabilities = raw.emotionProbabilities;
    song.reccobeatsId = raw.reccobeatsId;

    return song;
  }

  static toORM(entity: Partial<SongEntity>): Partial<SongEntityORM> {
    // If spotifyId is not provided but spotifyUrl is, extract it from the URL
    let spotifyId = entity.spotifyId;
    if (!spotifyId && entity.spotifyUrl) {
      const id = this.extractSpotifyId(entity.spotifyUrl);
      if (!id) throw new BadRequestException('Invalid Spotify URL provided');
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

    return response;
  }
}
