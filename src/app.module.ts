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
import validationSchemaConfig from "@app/common/validation-schema.config";
import { appConfig, environmentsConfig } from "@app/common/base.config";
import jwtConfig from "@app/common/jwt.config";
import refreshJwtConfig from "@app/common/refresh-jwt-config";
import { CategoryModule } from "./category/category.module";
import { SubcategoryModule } from "./subcategory/subcategory.module";
import { PublicRequestModule } from "./public-request/public-request.module";
import { QuoteModule } from "./quote/quote.module";
import { ProviderQuoteModule } from "./provider-quote/provider-quote.module";
import { PdfModule } from "./pdf/pdf.module";
import { ClsModule } from "nestjs-cls";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoadUserInterceptor } from "@app/common/interceptors/load-user.interceptor";
import { SearchModule } from "./search/search.module";

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
        CategoryModule,
        SubcategoryModule,
        PublicRequestModule,
        QuoteModule,
        ProviderQuoteModule, // NUEVO
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: validationSchemaConfig,
            validationOptions: {
                allowUnknown: true,
            },
            load: [appConfig, environmentsConfig, jwtConfig, refreshJwtConfig],
        }),
        PdfModule,
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true },
        }),
        SearchModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoadUserInterceptor,
        },
    ],
})
export class AppModule {}
