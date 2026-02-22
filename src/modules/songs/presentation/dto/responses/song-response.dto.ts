import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AudioFeaturesDto {
  @ApiPropertyOptional({
    description: 'Acousticness level (0.0 to 1.0)',
    example: 0.12,
  })
  acousticness?: number;

  @ApiPropertyOptional({
    description: 'Danceability level (0.0 to 1.0)',
    example: 0.68,
  })
  danceability?: number;

  @ApiPropertyOptional({
    description: 'Energy level (0.0 to 1.0)',
    example: 0.75,
  })
  energy?: number;

  @ApiPropertyOptional({
    description: 'Instrumentalness level (0.0 to 1.0)',
    example: 0.05,
  })
  instrumentalness?: number;

  @ApiPropertyOptional({
    description: 'Liveness level (0.0 to 1.0)',
    example: 0.15,
  })
  liveness?: number;

  @ApiPropertyOptional({
    description: 'Loudness in decibels',
    example: -5.2,
  })
  loudness?: number;

  @ApiPropertyOptional({
    description: 'Speechiness level (0.0 to 1.0)',
    example: 0.08,
  })
  speechiness?: number;

  @ApiPropertyOptional({
    description: 'Tempo in BPM',
    example: 120.5,
  })
  tempo?: number;

  @ApiPropertyOptional({
    description: 'Valence/positivity level (0.0 to 1.0)',
    example: 0.82,
  })
  valence?: number;
}

export class EmotionProbabilitiesDto {
  @ApiPropertyOptional({
    description: 'Probability of calm emotion',
    example: 0.02,
  })
  calm?: number;

  @ApiPropertyOptional({
    description: 'Probability of energetic emotion',
    example: 0.08,
  })
  energetic?: number;

  @ApiPropertyOptional({
    description: 'Probability of happy emotion',
    example: 0.85,
  })
  happy?: number;

  @ApiPropertyOptional({
    description: 'Probability of sad emotion',
    example: 0.05,
  })
  sad?: number;
}

export class SongResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the song',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Spotify track ID',
    example: '3n3Ppam7vgaVa1iaRUc9Lp',
  })
  spotifyId: string;

  @ApiProperty({
    description: 'Song title',
    example: 'Bohemian Rhapsody',
  })
  title: string;

  @ApiProperty({
    description: 'Artist name',
    example: 'Queen',
  })
  artist: string;

  @ApiProperty({
    description: 'Primary emotion associated with the song',
    example: 'happy',
  })
  emotion: string;

  @ApiProperty({
    description: 'Song duration in milliseconds',
    example: 354000,
  })
  durationMs: number;

  @ApiProperty({
    description: 'Spotify URL to the track',
    example: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
  })
  spotifyUrl: string;

  @ApiProperty({
    description: 'List of genres',
    type: [String],
    example: ['rock', 'classic rock'],
  })
  genres: string[];

  @ApiProperty({
    description: 'URL to the album/song image',
    example: 'https://i.scdn.co/image/ab67616d0000b273...',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Release date of the song',
    example: '1975-10-31T00:00:00.000Z',
  })
  releaseDate: Date;

  @ApiPropertyOptional({
    description: 'Audio features from emotion analysis',
    type: AudioFeaturesDto,
  })
  audioFeatures?: AudioFeaturesDto;

  @ApiPropertyOptional({
    description: 'Probabilities for each emotion category',
    type: EmotionProbabilitiesDto,
  })
  emotionProbabilities?: EmotionProbabilitiesDto;

  @ApiPropertyOptional({
    description: 'ReccoBeats track ID',
    example: 'track_abc123',
  })
  reccobeatsId?: string;

  @ApiProperty({
    description: 'Number of users who liked this song',
    example: 42,
  })
  likesCount: number;
}
