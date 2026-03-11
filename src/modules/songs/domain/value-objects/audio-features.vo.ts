export type AudioFeaturesVO = {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
};

export type IKeyAudioFeatures = Omit<
  AudioFeaturesVO,
  'key' | 'mode' | 'timeSignature'
>;
