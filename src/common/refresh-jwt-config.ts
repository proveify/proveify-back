import { registerAs } from "@nestjs/config";
import type { JwtSignOptions } from "@nestjs/jwt";

const refreshJwtConfig = (): JwtSignOptions => ({
    secret: process.env.REFRESH_JWT_SECRET,
    expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
});

export default registerAs("refresh-jwt", refreshJwtConfig);
