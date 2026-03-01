import { UserPreferencesEntity } from '@modules/users/domain/entities';
import { UserPreferencesResponseDto } from '@modules/users/presentation/dto/responses/user-preferences-response.dto';
import { Types } from 'mongoose';
import { UserPreferencesEntityORM } from '../orm/entities/user-preferences-entity.orm';

export class UserPreferencesMapper {
  static toDomain(ormEntity: UserPreferencesEntityORM): UserPreferencesEntity {
    const domainEntity = UserPreferencesEntity.reconstruct({
      id: ormEntity._id.toString(),
      userId: ormEntity.userId.toString(),
      likes: ormEntity.likes,
      dislikes: ormEntity.dislikes,
      listenedHistory: ormEntity.listenedHistory,
    });

    return domainEntity;
  }

  static toORM(
    domainEntity: UserPreferencesEntity,
  ): Partial<UserPreferencesEntityORM> {
    return {
      userId: new Types.ObjectId(domainEntity.userId),
      likes: domainEntity.likes,
      dislikes: domainEntity.dislikes,
      listenedHistory: domainEntity.listenedHistory,
    };
  }

  static toResponseDto(
    domainEntity: UserPreferencesEntity,
  ): UserPreferencesResponseDto {
    const response = new UserPreferencesResponseDto();

    response.id = domainEntity.id!;
    response.likes = domainEntity.likes;
    response.dislikes = domainEntity.dislikes;
    response.listenedHistory = domainEntity.listenedHistory;

    return response;
  }
}
