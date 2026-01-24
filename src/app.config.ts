import * as Joi from 'joi';

export const APP_CONFIG_SCHEMA = Joi.object({
  PORT: Joi.number().default(3000),
});

export const appConfig = () => ({
  app: {
    env: process.env.NODE_ENV || 'dev',
    port: parseInt(process.env.PORT || '3000', 10),
  },
});
