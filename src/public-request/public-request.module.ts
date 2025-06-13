import { Module } from "@nestjs/common";
import { PublicRequestController } from "./public-request.controller";
import { PublicRequestService } from "./public-request.service";
import { PublicRequestPrismaRepository } from "./repositories/public-request-prisma.repository";

@Module({
    controllers: [PublicRequestController],
    providers: [PublicRequestService, PublicRequestPrismaRepository],
    exports: [PublicRequestService],
})
export class PublicRequestModule {}
