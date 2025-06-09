import { Module } from "@nestjs/common";
import { PublicRequestController } from "./public-request.controller";
import { PublicRequestService } from "./public-request.service";
import { TransactionPrismaService } from "./transaction-prisma.service";

@Module({
    controllers: [PublicRequestController],
    providers: [PublicRequestService, TransactionPrismaService],
    exports: [PublicRequestService],
})
export class PublicRequestModule {}
