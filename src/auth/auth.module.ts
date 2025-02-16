import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "@app/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
    providers: [AuthService, JwtStrategy, LocalStrategy],
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: "15m" },
        }),
    ],
    controllers: [AuthController],
})
export class AuthModule {}
