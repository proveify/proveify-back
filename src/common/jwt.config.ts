import { registerAs } from "@nestjs/config";
import type { JwtModuleOptions } from "@nestjs/jwt";

const jwtOptions = (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
});

export default registerAs("jwt", jwtOptions);
