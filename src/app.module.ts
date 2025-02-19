import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ParameterModule } from "./parameter/parameter.module";

@Module({
    imports: [UserModule, PrismaModule, AuthModule, ParameterModule],
    providers: [],
})
export class AppModule {}
