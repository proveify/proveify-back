import { Global, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { OptionalJwtStrategy } from "./strategies/optional-jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { RefreshJwtStrategy } from "./strategies/refresh-jwt.strategy";
import { ParameterModule } from "@app/parameter/parameter.module";

import { PlanModule } from "@app/plan/plan.module";
import { ProviderModule } from "@app/provider/provider.module";
import jwtConfig from "@app/common/jwt.config";

@Global()
@Module({
    providers: [AuthService, JwtStrategy, OptionalJwtStrategy, LocalStrategy, RefreshJwtStrategy],
    imports: [
        ParameterModule,
        PlanModule,
        PassportModule,
        ProviderModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
    ],
    controllers: [AuthController],
    exports: [JwtModule],
})
export class AuthModule {}
