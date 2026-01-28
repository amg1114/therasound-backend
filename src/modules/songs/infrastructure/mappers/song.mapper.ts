import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongEntityORM } from '../orm/entities/song-entity.orm';
import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';

export class SongMapper {
  static toEntity(raw: SongEntityORM): SongEntity {
    const song = new SongEntity();

    song.id = raw._id.toString();
    song.title = raw.title;
    song.artist = raw.artist;
    song.emotion = SongEmotionVO.create(raw.emotion);
    song.durationMs = raw.durationMs;
    song.spotifyUrl = raw.spotifyUrl;
    song.genres = raw.genres;
    song.imageUrl = raw.imageUrl;
    song.releaseDate = raw.releaseDate;

    return song;
  }
}
