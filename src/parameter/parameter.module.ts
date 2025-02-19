import { Module } from "@nestjs/common";
import { ParameterService } from "./parameter.service";
import { ParameterController } from "./parameter.controller";

@Module({
    providers: [ParameterService],
    exports: [ParameterService],
    controllers: [ParameterController],
})
export class ParameterModule {}
