import {
  ArtistEntity,
  ArtistSummary,
  CreateArtistProps,
} from '@modules/artists/domain/entities';
import { MongoArtistEntity } from '../mongo/entities/mongo.artist.entity';

export class ArtistMapper {
  static toMongo(data: CreateArtistProps): Partial<MongoArtistEntity> {
    return {
      name: data.name,
      songsCount: data.songsCount,
      avatarUrl: data.avatarUrl,
    };
  }

  static toDomain(data: MongoArtistEntity): ArtistEntity {
    return ArtistEntity.reconstruct({
      id: data._id.toString(),
      name: data.name,
      songsCount: data.songsCount,
      avatarUrl: data.avatarUrl,
    });
  }

  static toSummary(data: ArtistEntity): ArtistSummary {
    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatarUrl,
    };
  }
}
