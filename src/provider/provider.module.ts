import { Module } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { ProviderController } from "./provider.controller";
import { ProviderPrismaRepository } from "./repositories/provider-prisma.repository";
import { ProviderFactory } from "@app/provider/factories/provider.factory";

@Module({
    providers: [ProviderService, ProviderPrismaRepository, ProviderFactory],
    imports: [ProviderModule],
    exports: [ProviderService, ProviderPrismaRepository, ProviderFactory],
    controllers: [ProviderController],
})
export class ProviderModule {}
