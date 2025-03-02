import { Module } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { PrismaModule } from "@app/prisma/prisma.module";

@Module({
    providers: [ProviderService],
    imports: [ProviderModule, PrismaModule],
    exports: [ProviderService],
})
export class ProviderModule {}
