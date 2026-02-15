import { EmotionType } from '@common/domain/value-objects/emotion.vo';
import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';
import { readFileSync } from 'fs';
import * as Joi from 'joi';
import { join } from 'path';
export type EmotionFeatureValues = Record<EmotionType, AudioFeaturesVO>;
export type AppConfig = {
  app: {
    env: string;
    port: number;
  };

  external_apis: {
    urls: {
      emotion_analysis: string;
      recco_beats: string;
      acr_cloud: string;
    };
    keys: {
      open_router: string;
      acr_cloud: string;
    };
  };

  database: {
    uri: string;
    name: string;
  };

  jwt: {
    secret: string;
  };

  emotion_analysis: {
    targets: EmotionFeatureValues;
    weights: EmotionFeatureValues;
  };

  default_seed_recommendations: string;
};

let emotionWeightsCache: EmotionFeatureValues | null = null;
let emotionTargetsCache: EmotionFeatureValues | null = null;

const loadEmotionWeights = (): EmotionFeatureValues => {
  if (!emotionWeightsCache) {
    const path = join(
      process.cwd(),
      'src/config',
      'feature_emotion_weights.json',
    );
    emotionWeightsCache = JSON.parse(readFileSync(path, 'utf-8')) as Record<
      EmotionType,
      AudioFeaturesVO
    >;
  }
  return emotionWeightsCache;
};

const loadEmotionTargets = (): EmotionFeatureValues => {
  if (!emotionTargetsCache) {
    const path = join(
      process.cwd(),
      'src/config',
      'feature_emotion_targets.json',
    );
    emotionTargetsCache = JSON.parse(readFileSync(path, 'utf-8')) as Record<
      EmotionType,
      AudioFeaturesVO
    >;
  }
  return emotionTargetsCache;
};

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

const DEFAULT_PORT = 3000;
const DEFAULT_JWT_SECRET = 'default_jwt_secret';
const RECCO_BEATS_URL = 'https://api.reccobeats.com/v1';
const ACR_CLOUD_URL = 'https://eu-api-v2.acrcloud.com/api';

export const appConfig = (): AppConfig => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT!, 10) || DEFAULT_PORT,
  },
  external_apis: {
    urls: {
      emotion_analysis: process.env.EMOTION_ANALYSIS_API_URL!,
      recco_beats: RECCO_BEATS_URL,
      acr_cloud: ACR_CLOUD_URL,
    },
    keys: {
      open_router: process.env.OPENROUTER_API_KEY!,
      acr_cloud: process.env.ACR_CLOUD_ACCESS_KEY!,
    },
  },
  database: {
    uri: process.env.DATABASE_URI!,
    name: process.env.DATABASE_NAME!,
  },
  jwt: {
    secret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  },
  emotion_analysis: {
    targets: loadEmotionTargets(),
    weights: loadEmotionWeights(),
  },
  default_seed_recommendations: process.env.DEFAULT_SEED_RECOMMENDATIONS!,
});
