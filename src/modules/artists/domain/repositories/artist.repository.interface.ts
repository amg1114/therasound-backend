import { ArtistEntity, CreateArtistProps } from '../entities';

export const ARTIST_REPOSITORY = 'ARTIST_REPOSITORY';

export interface ArtistRepository {
  findById(id: string): Promise<ArtistEntity | null>;
  findByName(name: string): Promise<ArtistEntity | null>;
  findBySpotifyId(spotifyId: string): Promise<ArtistEntity | null>;
  findAll(): Promise<ArtistEntity[]>;
  create(artist: CreateArtistProps): Promise<ArtistEntity>;
  save(artist: ArtistEntity): Promise<ArtistEntity>;
}
