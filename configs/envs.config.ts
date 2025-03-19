export const APP_PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3001;

export const APP_IS_PROD = process.env.APP_ENV === "production";
export const APP_IS_TESTING = process.env.APP_ENV === "testing";
export const APP_IS_DEVELOPMENT = process.env.APP_ENV === "development";
export const APP_ENV = process.env.APP_ENV ?? "development";
export const CORS_URL_LIST = process.env.CORS_ULRS?.split(",") ?? [];
