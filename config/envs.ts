export const APP_PORT = process.env.APP_PORT
  ? parseInt(process.env.APP_PORT, 10)
  : 3000;

export const APP_IS_PROD = process.env.APP_ENV === 'prod';
export const APP_IS_TESTING = process.env.APP_ENV === 'testing';
export const APP_IS_DEVELOPMENT = process.env.APP_ENV === 'development';
