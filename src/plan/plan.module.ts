import { Module } from "@nestjs/common";
import { PlanService } from "./plan.service";

@Module({
    providers: [PlanService],
    exports: [PlanService],
    imports: [],
})
export class PlanModule {}
