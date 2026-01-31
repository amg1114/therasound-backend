import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { PlaylistEntityORM } from '../orm/entities/playlist-entity.orm';
import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { Types } from 'mongoose';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { PlaylistResponseDto } from '@modules/playlists/presentation/dto/responses/playlist-response.dto';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';

export class PlaylistMapper {
  static toDomain(ormEntity: PlaylistEntityORM): PlaylistEntity {
    const songs = ormEntity.songs.map((embeddedSong) => {
      const song = new SongEntity();
      song.id = embeddedSong.songId.toString();
      song.title = embeddedSong.title;
      song.artist = embeddedSong.artist;
      song.emotion = SongEmotionVO.create(embeddedSong.emotion);
      song.durationMs = embeddedSong.durationMs;
      song.spotifyUrl = embeddedSong.spotifyUrl;
      song.genres = embeddedSong.genres;
      song.imageUrl = embeddedSong.imageUrl;
      song.releaseDate = embeddedSong.releaseDate;
      return song;
    });

    return PlaylistEntity.reconstruct({
      id: ormEntity._id.toString(),
      userId: ormEntity.userId.toString(),
      songs,
      emotion: SongEmotionVO.create(ormEntity.emotion),
      durationMs: ormEntity.durationMs,
      createdAt: ormEntity.createdAt,
    });
  }

  static toORM(
    domainEntity: Partial<PlaylistEntity>,
  ): Partial<PlaylistEntityORM> {
    return {
      userId: domainEntity.userId
        ? new Types.ObjectId(domainEntity.userId)
        : undefined,
      songs: domainEntity.songs
        ? domainEntity.songs.map((song) => ({
            songId: new Types.ObjectId(song.id),
            title: song.title,
            artist: song.artist,
            emotion: song.emotion.getValue(),
            durationMs: song.durationMs,
            spotifyUrl: song.spotifyUrl,
            genres: song.genres,
            imageUrl: song.imageUrl,
            releaseDate: song.releaseDate,
          }))
        : undefined,
      emotion: domainEntity.emotion?.getValue(),
      durationMs: domainEntity.durationMs,
    };
  }

  static toResponseDto(entity: PlaylistEntity): PlaylistResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      songs: entity.songs.map((song) => SongMapper.toResponseDto(song)),
      emotion: entity.emotion.getValue(),
      durationMs: entity.durationMs,
      createdAt: entity.createdAt,
    };
  }
}
