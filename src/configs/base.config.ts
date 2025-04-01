import { registerAs } from "@nestjs/config";

export const enviromentsConfig = registerAs("enviroments", () => ({
    enviroment: process.env.APP_ENV,
    appIsProd: process.env.APP_ENV === "production",
    appIsTesting: process.env.APP_ENV === "testing",
    AppIsDevelopment: process.env.APP_ENV === "development",
}));

export const appConfig = registerAs("app", () => ({
    port: process.env.APP_PORT,
    corsUrlList: process.env.CORS_ULRS?.split(",") ?? [],
    bucket: process.env.BUCKET,
    keyFilename: process.env.KEY_FILENAME,
}));
