/**
 * Represents a summary view of an artist entity.
 * Contains only the essential identifying and visual information of an artist.
 *
 * @property {string} id - The unique identifier of the artist
 * @property {string} name - The display name of the artist
 * @property {string} avatarUrl - The URL to the artist's avatar image
 */
export type ArtistSummary = Pick<
  ArtistEntityProps,
  'id' | 'name' | 'avatarUrl'
>;

/**
 * Properties required to create a new Artist entity.
 * Omits the auto-generated `id` field from the full ArtistEntityProps.
 */
export type CreateArtistProps = Omit<ArtistEntityProps, 'id'>;

/**
 * Properties that define an Artist entity.
 *
 * @interface ArtistEntityProps
 * @property {string} id - The unique identifier for the artist.
 * @property {string} name - The name of the artist.
 * @property {number} songsCount - The total number of songs created by the artist.
 * @property {string} [avatarUrl] - Optional URL pointing to the artist's avatar image.
 */
export interface ArtistEntityProps {
  id: string;
  name: string;
  songsCount: number;
  avatarUrl?: string;
  spotifyId: string;
}

/**
 * Represents an artist entity in the domain layer.
 *
 * @class ArtistEntity
 * @implements {ArtistEntityProps}
 *
 * @property {string} id - The unique identifier of the artist
 * @property {string} name - The name of the artist
 * @property {number} songsCount - The total number of songs created by the artist
 * @property {string} avatarUrl - URL to the artist's avatar image
 * @property {string} spotifyId - The Spotify ID of the artist
 *
 * @example
 * // Create a new artist entity
 * const props = ArtistEntity.create({
 *   name: "John Doe",
 *   avatarUrl: "https://example.com/avatar.jpg",
 *   spotifyId: "123456789"
 * });
 *
 * @example
 * // Reconstruct an artist entity from properties
 * const artist = ArtistEntity.reconstruct({
 *   id: "123",
 *   name: "John Doe",
 *   songsCount: 10,
 *   avatarUrl: "https://example.com/avatar.jpg"
 * });
 */
export class ArtistEntity implements ArtistEntityProps {
  id: string;
  name: string;
  songsCount: number;
  avatarUrl?: string;
  spotifyId: string;

  constructor(props: ArtistEntityProps) {
    this.id = props.id;
    this.name = props.name;
    this.songsCount = props.songsCount;
    this.avatarUrl = props.avatarUrl;
    this.spotifyId = props.spotifyId;
  }

  static create(
    props: Omit<CreateArtistProps, 'songsCount'> & { songsCount?: number },
  ): CreateArtistProps {
    return {
      name: props.name,
      songsCount: props.songsCount ?? 0,
      avatarUrl: props.avatarUrl,
      spotifyId: props.spotifyId,
    };
  }

  static reconstruct(props: ArtistEntityProps): ArtistEntity {
    return new ArtistEntity(props);
  }
}
