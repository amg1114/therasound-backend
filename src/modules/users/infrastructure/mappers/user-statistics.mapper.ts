import {
  CreateUserStatisticsProps,
  UserStatisticsEntity,
} from '@modules/users/domain/entities';
import { Types } from 'mongoose';
import { MongoUserStatisticsEntity } from '../mongo/entities';

export class UserStatisticsMapper {
  static toDomain(ormEntity: MongoUserStatisticsEntity): UserStatisticsEntity {
    const domainEntity = UserStatisticsEntity.reconstitute({
      id: ormEntity._id.toString(),
      userId: ormEntity.userId.toString(),
      lastListeningDate: ormEntity.lastListeningDate,
      streakActivationDate: ormEntity.streakActivationDate,
      totalSongsListened: ormEntity.totalSongsListened,
      totalListeningTimeMs: ormEntity.totalListeningTimeMs,
      totalPlaylists: ormEntity.totalPlaylists,
    });

    return domainEntity;
  }

  static toPersistence(
    domainEntity: CreateUserStatisticsProps,
  ): Partial<MongoUserStatisticsEntity> {
    return {
      userId: new Types.ObjectId(domainEntity.userId),
      lastListeningDate: domainEntity.lastListeningDate,
      streakActivationDate: domainEntity.streakActivationDate,
      totalSongsListened: domainEntity.totalSongsListened,
      totalListeningTimeMs: domainEntity.totalListeningTimeMs,
      totalPlaylists: domainEntity.totalPlaylists,
    };
  }
}
