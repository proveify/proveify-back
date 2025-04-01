import { Module } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { PrismaModule } from "@app/prisma/prisma.module";
import { ProviderController } from "./provider.controller";
import { FileModule } from "@app/file/file.module";
import { NestjsFormDataModule } from "nestjs-form-data";

@Module({
    providers: [ProviderService],
    imports: [ProviderModule, PrismaModule, FileModule, NestjsFormDataModule],
    exports: [ProviderService],
    controllers: [ProviderController],
})
export class ProviderModule {}
