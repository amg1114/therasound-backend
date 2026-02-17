import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { PlaylistResponseDto } from '@modules/playlists/presentation/dto/responses/playlist-response.dto';
import { PlaylistSummaryResponseDto } from '@modules/playlists/presentation/dto/responses/playlist-summary-response.dto';
import { Types } from 'mongoose';
import { PlaylistEntityORM } from '../orm/entities/playlist-entity.orm';

export class PlaylistMapper {
  static toDomain(ormEntity: PlaylistEntityORM): PlaylistEntity {
    return PlaylistEntity.reconstruct({
      id: ormEntity._id.toString(),
      title: ormEntity.title,
      userId: ormEntity.userId.toString(),
      songs: ormEntity.songs,
      emotion: EmotionVO.create(ormEntity.emotion),
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
      emotion: domainEntity.emotion?.getValue(),
      durationMs: domainEntity.durationMs,
    };
  }

  static toResponseDto(entity: PlaylistEntity): PlaylistResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      songs: entity.songs,
      emotion: entity.emotion.getValue(),
      durationMs: entity.durationMs,
      createdAt: entity.createdAt,
    };
  }

  static toSummaryDto(entity: PlaylistEntity): PlaylistSummaryResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      emotion: entity.emotion.getValue(),
      songCount: entity.songs.length,
      createdAt: entity.createdAt,
    };
  }
}
