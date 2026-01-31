import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { UserPreferencesEntityORM } from '../orm/entities/user-preferences-entity.orm';
import { Types } from 'mongoose';
import { UserPreferencesResponseDto } from '@modules/users/presentation/dto/responses/user-preferences-response.dto';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { SongEntityORM } from '@modules/songs/infrastructure/orm/entities/song-entity.orm';

export class UserPreferencesMapper {
  static toDomain(ormEntity: UserPreferencesEntityORM): UserPreferencesEntity {
    const domainEntity = UserPreferencesEntity.reconstruct({
      id: ormEntity._id.toString(),
      user: ormEntity.user.toString(),
      likedSongs: Array.isArray(ormEntity.likedSongs)
        ? ormEntity.likedSongs.map((song) =>
            song instanceof Types.ObjectId
              ? ({ id: song.toString() } as any)
              : SongMapper.toEntity(song as SongEntityORM),
          )
        : [],
      dislikedSongs: Array.isArray(ormEntity.dislikedSongs)
        ? ormEntity.dislikedSongs.map((song) =>
            song instanceof Types.ObjectId
              ? ({ id: song.toString() } as any)
              : SongMapper.toEntity(song as SongEntityORM),
          )
        : [],
      dislikedGenres: ormEntity.dislikedGenres,
      dislikedArtists: ormEntity.dislikedArtists,
    });

    return domainEntity;
  }

  static toORM(
    domainEntity: UserPreferencesEntity,
  ): Partial<UserPreferencesEntityORM> {
    return {
      likedSongs: domainEntity.likedSongs.map(
        (song) => new Types.ObjectId(song.id),
      ),
      dislikedSongs: domainEntity.dislikedSongs.map(
        (song) => new Types.ObjectId(song.id),
      ),
      dislikedGenres: domainEntity.dislikedGenres,
      dislikedArtists: domainEntity.dislikedArtists,
      user: new Types.ObjectId(domainEntity.user),
    };
  }

  static toResponseDto(
    domainEntity: UserPreferencesEntity,
  ): UserPreferencesResponseDto {
    const response = new UserPreferencesResponseDto();

    response.id = domainEntity.id!;
    response.likedSongs = domainEntity.likedSongs.map((song) =>
      SongMapper.toResponseDto(song),
    );
    response.dislikedSongs = domainEntity.dislikedSongs.map((song) =>
      SongMapper.toResponseDto(song),
    );
    response.dislikedGenres = domainEntity.dislikedGenres;
    response.dislikedArtists = domainEntity.dislikedArtists;

    return response;
  }
}
