import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "@app/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";

@Module({
    providers: [AuthService],
    imports: [UserModule, JwtModule],
    controllers: [AuthController],
})
export class AuthModule {}
