import { Module } from "@nestjs/common";
import { ProviderQuoteController } from "./provider-quote.controller";
import { ProviderQuoteService } from "./provider-quote.service";
import { ProviderQuotePrismaRepository } from "./repositories/provider-quote-prisma.repository";
import { ProviderQuoteFactory } from "./factories/provider-quote.factory";
import { ProviderModule } from "@app/provider/provider.module";
import { ItemModule } from "@app/item/item.module";

@Module({
    controllers: [ProviderQuoteController],
    providers: [ProviderQuoteService, ProviderQuotePrismaRepository, ProviderQuoteFactory],
    imports: [ProviderModule, ItemModule],
    exports: [ProviderQuoteService, ProviderQuotePrismaRepository],
})
export class ProviderQuoteModule {}
