import { registerAs } from "@nestjs/config";

export const environmentsConfig = registerAs("environments", () => ({
    environment: process.env.APP_ENV,
    isProd: process.env.APP_ENV === "production",
    isTesting: process.env.APP_ENV === "testing",
    isDevelopment: process.env.APP_ENV === "development",
}));

export const appConfig = registerAs("app", () => ({
    port: process.env.APP_PORT,
    corsUrlList: process.env.CORS_ULRS?.split(",") ?? [],
    bucket: process.env.BUCKET,
    keyFilename: process.env.KEY_FILENAME,
    glitchtipDsn: process.env.GLITCHTIP_DSN,
}));
