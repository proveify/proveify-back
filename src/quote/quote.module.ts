import { Module } from "@nestjs/common";
import { QuoteController } from "./quote.controller";
import { QuoteService } from "./quote.service";
import { QuotePrismaRepository } from "./repositories/quote-prisma.repository";

@Module({
    controllers: [QuoteController],
    providers: [QuoteService, QuotePrismaRepository],
    exports: [QuoteService],
})
export class QuoteModule {}
