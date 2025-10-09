import { Module } from "@nestjs/common";
import { QuoteController } from "./quote.controller";
import { QuoteService } from "./quote.service";
import { QuotePrismaRepository } from "./repositories/quote-prisma.repository";
import { QuoteChatGateway } from "@app/quote/gateways/quote-chat.gateway";
import { QuoteFactory } from "@app/quote/factories/quote.factory";

@Module({
    controllers: [QuoteController],
    providers: [QuoteService, QuotePrismaRepository, QuoteChatGateway, QuoteFactory],
    exports: [QuoteService],
})
export class QuoteModule {}
