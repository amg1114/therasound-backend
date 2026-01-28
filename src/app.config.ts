import * as Joi from 'joi';

export const APP_CONFIG_SCHEMA = Joi.object({
  PORT: Joi.number().default(3000),
  OPENROUTER_API_KEY: Joi.string().required(),
  DATABASE_URI: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().default('default_jwt_secret'),
});

export const appConfig = () => ({
  app: {
    env: process.env.NODE_ENV || 'dev',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  database: {
    uri: process.env.DATABASE_URI,
    name: process.env.DATABASE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
  },
});
