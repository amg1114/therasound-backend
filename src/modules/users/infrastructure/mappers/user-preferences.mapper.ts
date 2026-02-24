import { UserPreferencesEntity } from '@modules/users/domain/entities';
import { UserPreferencesResponseDto } from '@modules/users/presentation/dto/responses/user-preferences-response.dto';
import { Types } from 'mongoose';
import { UserPreferencesEntityORM } from '../orm/entities/user-preferences-entity.orm';

export class UserPreferencesMapper {
  static toDomain(ormEntity: UserPreferencesEntityORM): UserPreferencesEntity {
    const domainEntity = UserPreferencesEntity.reconstruct({
      id: ormEntity._id.toString(),
      userId: ormEntity.userId.toString(),
      likedSongs: ormEntity.likedSongs,
      dislikedSongs: ormEntity.dislikedSongs,
      likedGenres: ormEntity.likedGenres,
      dislikedGenres: ormEntity.dislikedGenres,
      likedArtists: ormEntity.likedArtists,
      dislikedArtists: ormEntity.dislikedArtists,
      listenedHistory: ormEntity.listenedHistory,
    });

    return domainEntity;
  }

  static toORM(
    domainEntity: UserPreferencesEntity,
  ): Partial<UserPreferencesEntityORM> {
    return {
      userId: new Types.ObjectId(domainEntity.userId),
      likedSongs: domainEntity.likedSongs,
      dislikedSongs: domainEntity.dislikedSongs,
      likedGenres: domainEntity.likedGenres,
      dislikedGenres: domainEntity.dislikedGenres,
      likedArtists: domainEntity.likedArtists,
      dislikedArtists: domainEntity.dislikedArtists,
      listenedHistory: domainEntity.listenedHistory,
    };
  }

  static toResponseDto(
    domainEntity: UserPreferencesEntity,
  ): UserPreferencesResponseDto {
    const response = new UserPreferencesResponseDto();

    response.id = domainEntity.id!;
    response.likedSongs = domainEntity.likedSongs;
    response.dislikedSongs = domainEntity.dislikedSongs;
    response.likedGenres = domainEntity.likedGenres;
    response.dislikedGenres = domainEntity.dislikedGenres;
    response.likedArtists = domainEntity.likedArtists;
    response.dislikedArtists = domainEntity.dislikedArtists;
    response.listenedHistory = domainEntity.listenedHistory;

    return response;
  }
}
