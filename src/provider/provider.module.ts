import { Module } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { PrismaModule } from "@app/prisma/prisma.module";
import { ProviderController } from "./provider.controller";

@Module({
    providers: [ProviderService],
    imports: [ProviderModule, PrismaModule],
    exports: [ProviderService],
    controllers: [ProviderController],
})
export class ProviderModule {}
