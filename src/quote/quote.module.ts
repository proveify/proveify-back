import { Module } from "@nestjs/common";
import { QuoteController } from "./quote.controller";
import { QuoteService } from "./quote.service";
import { QuotePrismaRepository } from "./repositories/quote-prisma.repository";
import { QuoteChatGateway } from "@app/quote/gateways/quote-chat.gateway";

@Module({
    controllers: [QuoteController],
    providers: [QuoteService, QuotePrismaRepository, QuoteChatGateway],
    exports: [QuoteService],
})
export class QuoteModule {}
