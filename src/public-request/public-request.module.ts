import { Module } from "@nestjs/common";
import { PublicRequestController } from "./public-request.controller";
import { PublicRequestService } from "./public-request.service";
import { PublicRequestPrismaRepository } from "./repositories/public-request-prisma.repository";
import { QuoteModule } from "@app/quote/quote.module";
import { ProviderQuoteModule } from "@app/provider-quote/provider-quote.module";
import { PublicRequestFactory } from "./factories/public-request.factory";

@Module({
    controllers: [PublicRequestController],
    providers: [PublicRequestService, PublicRequestPrismaRepository, PublicRequestFactory],
    imports: [QuoteModule, ProviderQuoteModule],
    exports: [PublicRequestService, PublicRequestFactory],
})
export class PublicRequestModule {}
