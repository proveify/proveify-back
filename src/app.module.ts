import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ParameterModule } from "./parameter/parameter.module";
import { ProviderModule } from "./provider/provider.module";
import { FileModule } from "./file/file.module";
import { NestjsFormDataModule } from "nestjs-form-data";
import { PlanModule } from "./plan/plan.module";
import { ItemModule } from "./item/item.module";

@Module({
    imports: [
        UserModule,
        PrismaModule,
        AuthModule,
        ParameterModule,
        ProviderModule,
        FileModule,
        NestjsFormDataModule,
        PlanModule,
        ItemModule,
    ],
    providers: [],
})
export class AppModule {}
