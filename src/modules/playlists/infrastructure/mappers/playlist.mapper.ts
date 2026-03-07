import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { IPlaylistSummary } from '@modules/playlists/application/interfaces';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { PlaylistResponseDto } from '@modules/playlists/presentation/dto/responses/playlist-response.dto';
import { Types } from 'mongoose';
import { PlaylistEntityORM } from '../orm/entities/playlist-entity.orm';

export class PlaylistMapper {
  static toDomain(ormEntity: PlaylistEntityORM): PlaylistEntity {
    return PlaylistEntity.reconstruct({
      id: ormEntity._id.toString(),
      title: ormEntity.title,
      userId: ormEntity.userId.toString(),
      songs: ormEntity.songs,
      initialEmotion: EmotionVO.create(ormEntity.initialEmotion),
      targetEmotion: EmotionVO.create(ormEntity.targetEmotion),
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
      title: domainEntity.title,
      songs: domainEntity.songs,
      initialEmotion: domainEntity.initialEmotion?.getValue(),
      targetEmotion: domainEntity.targetEmotion?.getValue(),
      durationMs: domainEntity.durationMs,
    };
  }

  static toResponseDto(entity: PlaylistEntity): PlaylistResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      songs: entity.songs,
      targetEmotion: entity.targetEmotion.getValue(),
      initialEmotion: entity.initialEmotion.getValue(),
      durationMs: entity.durationMs,
      createdAt: entity.createdAt,
    };
  }

  static toSummary(entity: PlaylistEntity): IPlaylistSummary {
    return {
      id: entity.id,
      title: entity.title,
      initialEmotion: entity.initialEmotion.getValue(),
      targetEmotion: entity.targetEmotion.getValue(),
      durationMs: entity.durationMs,
      songCount: entity.songs.length,
      createdAt: entity.createdAt,
    };
  }
}
