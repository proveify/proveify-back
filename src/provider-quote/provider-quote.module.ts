import { Module } from "@nestjs/common";
import { ProviderQuoteController } from "./provider-quote.controller";
import { ProviderQuoteService } from "./provider-quote.service";
import { ProviderQuotePrismaRepository } from "./repositories/provider-quote-prisma.repository";

@Module({
    controllers: [ProviderQuoteController],
    providers: [ProviderQuoteService, ProviderQuotePrismaRepository],
    exports: [ProviderQuoteService, ProviderQuotePrismaRepository],
})
export class ProviderQuoteModule {}
