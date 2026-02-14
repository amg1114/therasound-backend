export type AudioFeaturesVO = {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  timeSignature: number;
  valence: number;
};

export type IKeyAudioFeatures = Omit<
  AudioFeaturesVO,
  'key' | 'mode' | 'timeSignature'
>;
