import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "@app/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { RefreshJwtStrategy } from "./strategies/refresh-jwt.strategy";
import jwtConfig from "./config/jwt.config";
import { ConfigModule } from "@nestjs/config";
import refreshJwtConfig from "./config/refresh-jwt-config";

@Module({
    providers: [AuthService, JwtStrategy, LocalStrategy, RefreshJwtStrategy],
    imports: [
        UserModule,
        PassportModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(refreshJwtConfig),
    ],
    controllers: [AuthController],
})
export class AuthModule {}
