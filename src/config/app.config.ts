import { EmotionType } from '@common/domain/value-objects/emotion.vo';
import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';
import { readFileSync } from 'fs';
import * as Joi from 'joi';
import { join } from 'path';

export type AppConfig = {
  app: {
    env: string;
    port: number;
  };
  openrouter: {
    apiKey: string;
  };
  database: {
    uri: string;
    name: string;
  };
  jwt: {
    secret: string;
  };
  soundcharts: {
    appId: string;
    apiKey: string;
  };
  emotionAnalysis: {
    apiUrl: string;
  };
  emotionWeights: Record<EmotionType, AudioFeaturesVO>;
  emotionFeatureTargets: Record<EmotionType, AudioFeaturesVO>;
  defaultSeedRecommendations: string;
  acrCloud: {
    accessKey: string;
  };
};

const emotionWeightsPath = join(
  process.cwd(),
  'src/config',
  'feature_emotion_weights.json',
);
const emotionWeights = JSON.parse(
  readFileSync(emotionWeightsPath, 'utf-8'),
) as Record<EmotionType, AudioFeaturesVO>;

const emotionFeatureTargetsPath = join(
  process.cwd(),
  'src/config',
  'feature_emotion_targets.json',
);
const emotionFeatureTargets = JSON.parse(
  readFileSync(emotionFeatureTargetsPath, 'utf-8'),
) as Record<EmotionType, AudioFeaturesVO>;

export const APP_CONFIG_SCHEMA = Joi.object({
  PORT: Joi.number().default(3000),
  OPENROUTER_API_KEY: Joi.string().required(),
  DATABASE_URI: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().default('default_jwt_secret'),
  SOUNDCHARTS_APP_ID: Joi.string().required(),
  SOUNDCHARTS_API_KEY: Joi.string().required(),
  EMOTION_ANALYSIS_API_URL: Joi.string().default('http://localhost:8000'),
  DEFAULT_SEED_RECOMMENDATIONS: Joi.string().required(),
  ACR_CLOUD_ACCESS_KEY: Joi.string().required(),
});

export const appConfig = (): AppConfig => ({
  app: {
    env: process.env.NODE_ENV || 'dev',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY!,
  },
  database: {
    uri: process.env.DATABASE_URI!,
    name: process.env.DATABASE_NAME!,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
  },
  soundcharts: {
    appId: process.env.SOUNDCHARTS_APP_ID!,
    apiKey: process.env.SOUNDCHARTS_API_KEY!,
  },
  emotionAnalysis: {
    apiUrl: process.env.EMOTION_ANALYSIS_API_URL || 'http://localhost:8000',
  },
  emotionWeights,
  emotionFeatureTargets,
  defaultSeedRecommendations: process.env.DEFAULT_SEED_RECOMMENDATIONS!,
  acrCloud: {
    accessKey: process.env.ACR_CLOUD_ACCESS_KEY!,
  },
});
