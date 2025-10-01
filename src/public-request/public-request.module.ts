import { Module } from "@nestjs/common";
import { PublicRequestController } from "./public-request.controller";
import { PublicRequestService } from "./public-request.service";
import { PublicRequestPrismaRepository } from "./repositories/public-request-prisma.repository";
import { QuoteModule } from "@app/quote/quote.module";

@Module({
    controllers: [PublicRequestController],
    providers: [PublicRequestService, PublicRequestPrismaRepository],
    imports: [QuoteModule],
    exports: [PublicRequestService],
})
export class PublicRequestModule {}
