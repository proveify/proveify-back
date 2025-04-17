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
import { ConfigModule } from "@nestjs/config";
import validationSchemaConfig from "./configs/validation-schema.config";
import { appConfig, enviromentsConfig } from "./configs/base.config";
import { QuoteModule } from "./quote/quote.module";
import jwtConfig from "./configs/jwt.config";
import refreshJwtConfig from "./configs/refresh-jwt-config";
@Module({
    imports: [
        UserModule,
        PrismaModule,
        AuthModule,
        ParameterModule,
        ProviderModule,
        FileModule,
        NestjsFormDataModule.config({
            isGlobal: true,
        }),
        PlanModule,
        ItemModule,
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: validationSchemaConfig,
            validationOptions: {
                allowUnknown: true,
            },
            load: [appConfig, enviromentsConfig, jwtConfig, refreshJwtConfig],
        }),
        QuoteModule,
    ],
    providers: [],
})
export class AppModule {}
