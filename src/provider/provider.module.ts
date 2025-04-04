import { Module } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { ProviderController } from "./provider.controller";

@Module({
    providers: [ProviderService],
    imports: [ProviderModule],
    exports: [ProviderService],
    controllers: [ProviderController],
})
export class ProviderModule {}
