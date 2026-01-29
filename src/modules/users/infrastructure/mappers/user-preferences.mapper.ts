import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { UserPreferencesEntityORM } from '../orm/entities/user-preferences-entity.orm';
import { Types } from 'mongoose';
import { UserPreferencesResponseDto } from '@modules/users/presentation/dto/responses/user-preferences-response.dto';

export class UserPreferencesMapper {
  static toDomain(ormEntity: UserPreferencesEntityORM): UserPreferencesEntity {
    const domainEntity = UserPreferencesEntity.reconstruct({
      id: ormEntity._id.toString(),
      user: ormEntity.user.toString(),
      likedSongs: ormEntity.likedSongs.map((id) => id.toString()),
      dislikedSongs: ormEntity.dislikedSongs.map((id) => id.toString()),
      dislikedGenres: ormEntity.dislikedGenres,
      dislikedArtists: ormEntity.dislikedArtists,
    });

    return domainEntity;
  }

  static toORM(
    domainEntity: UserPreferencesEntity,
  ): Partial<UserPreferencesEntityORM> {
    return {
      likedSongs: domainEntity.likedSongs.map((id) => new Types.ObjectId(id)),
      dislikedSongs: domainEntity.dislikedSongs.map(
        (id) => new Types.ObjectId(id),
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
    response.likedSongs = domainEntity.likedSongs;
    response.dislikedSongs = domainEntity.dislikedSongs;
    response.dislikedGenres = domainEntity.dislikedGenres;
    response.dislikedArtists = domainEntity.dislikedArtists;

    return response;
  }
}
