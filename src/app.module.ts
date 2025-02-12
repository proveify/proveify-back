import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { RegisterModule } from "./register/register.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
    imports: [UserModule, RegisterModule, PrismaModule],
    providers: [],
})
export class AppModule {}
