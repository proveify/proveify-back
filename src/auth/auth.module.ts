import { Global, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "@app/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { RefreshJwtStrategy } from "./strategies/refresh-jwt.strategy";
import { ParameterModule } from "@app/parameter/parameter.module";

import { PlanModule } from "@app/plan/plan.module";
import { ProviderModule } from "@app/provider/provider.module";
import jwtConfig from "@app/configs/jwt.config";
import { AuthContextService } from "./auth-context.service";

@Global()
@Module({
    providers: [AuthService, JwtStrategy, LocalStrategy, RefreshJwtStrategy, AuthContextService],
    imports: [
        UserModule,
        ParameterModule,
        PlanModule,
        PassportModule,
        ProviderModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
    ],
    controllers: [AuthController],
    exports: [AuthContextService],
})
export class AuthModule {}
