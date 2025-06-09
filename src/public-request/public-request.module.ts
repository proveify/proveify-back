import { Module } from "@nestjs/common";
import { PublicRequestController } from "./public-request.controller";
import { PublicRequestService } from "./public-request.service";

@Module({
    controllers: [PublicRequestController],
    providers: [PublicRequestService],
    exports: [PublicRequestService],
})
export class PublicRequestModule {}
