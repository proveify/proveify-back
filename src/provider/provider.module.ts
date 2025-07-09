import { Module } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { ProviderController } from "./provider.controller";
import { ProviderPrismaRepository } from "./repositories/provider-prisma.repository";

@Module({
    providers: [ProviderService, ProviderPrismaRepository],
    imports: [ProviderModule],
    exports: [ProviderService, ProviderPrismaRepository],
    controllers: [ProviderController],
})
export class ProviderModule {}
