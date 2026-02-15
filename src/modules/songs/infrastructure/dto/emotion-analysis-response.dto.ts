export interface AudioFeaturesDto {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
}

export interface EmotionProbabilitiesDto {
  calm: number;
  energetic: number;
  happy: number;
  sad: number;
}

export interface EmotionAnalysisResponseDto {
  audio_features: AudioFeaturesDto;
  confidence: number;
  emotion: string;
  probabilities: EmotionProbabilitiesDto;
  reccobeats_id?: string;
}
