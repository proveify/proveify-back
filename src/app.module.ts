import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ParameterModule } from "./parameter/parameter.module";
import { ProviderModule } from "./provider/provider.module";
import { FileModule } from "./file/file.module";
import { NestjsFormDataModule } from "nestjs-form-data";

@Module({
    imports: [
        UserModule,
        PrismaModule,
        AuthModule,
        ParameterModule,
        ProviderModule,
        FileModule,
        NestjsFormDataModule,
    ],
    providers: [],
})
export class AppModule {}
