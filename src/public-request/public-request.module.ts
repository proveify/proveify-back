import { Module } from "@nestjs/common";
import { PublicRequestController } from "./public-request.controller";
import { PublicRequestService } from "./public-request.service";
import { TransactionPrismaService } from "./repositories/public-request-prisma.repository";

@Module({
    controllers: [PublicRequestController],
    providers: [PublicRequestService, TransactionPrismaService],
    exports: [PublicRequestService],
})
export class PublicRequestModule {}
