import { UserStatisticsEntity } from '@modules/users/domain/entities';
import { Types } from 'mongoose';
import { UserStatisticsEntityORM } from '../orm/entities';

export class UserStatisticsMapper {
  static toDomain(ormEntity: UserStatisticsEntityORM): UserStatisticsEntity {
    const domainEntity = UserStatisticsEntity.reconstitute({
      id: ormEntity._id.toString(),
      userId: ormEntity.userId.toString(),
      lastListeningDate: ormEntity.lastListeningDate,
      streakActivationDate: ormEntity.streakActivationDate,
      totalListeningTimeMs: ormEntity.totalListeningTimeMs,
      totalPlaylists: ormEntity.totalPlaylists,
    });

    return domainEntity;
  }

  static toORM(
    domainEntity: UserStatisticsEntity,
  ): Partial<UserStatisticsEntityORM> {
    return {
      _id: new Types.ObjectId(domainEntity.id),
      userId: new Types.ObjectId(domainEntity.userId),
      lastListeningDate: domainEntity.lastListeningDate,
      streakActivationDate: domainEntity.streakActivationDate,
      totalListeningTimeMs: domainEntity.totalListeningTimeMs,
      totalPlaylists: domainEntity.totalPlaylists,
    };
  }
}
