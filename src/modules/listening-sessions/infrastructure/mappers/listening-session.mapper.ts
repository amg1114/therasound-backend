import { ListeningSessionEntity } from '@modules/listening-sessions/domain/entities';
import { Types } from 'mongoose';
import { MongoListeningSessionEntity } from '../mongo/entities';

export class ListeningSessionMapper {
  static toEntity(data: MongoListeningSessionEntity): ListeningSessionEntity {
    return ListeningSessionEntity.reconstruct({
      id: data._id.toString(),
      userId: data.userId.toString(),
      playlistId: data.playlistId.toString(),
      initialAnxietyLevel: data.initialAnxietyLevel,
      finalAnxietyLevel: data.finalAnxietyLevel,
      completionRate: data.completionRate,
      abandoned: data.abandoned,
    });
  }

  static toMongo(
    data: ListeningSessionEntity,
  ): Partial<MongoListeningSessionEntity> {
    return {
      userId: new Types.ObjectId(data.userId),
      playlistId: new Types.ObjectId(data.playlistId),
      initialAnxietyLevel: data.initialAnxietyLevel,
      finalAnxietyLevel: data.finalAnxietyLevel,
      completionRate: data.completionRate,
      abandoned: data.abandoned,
    };
  }
}
