import { Module } from "@nestjs/common";
import { PlanService } from "./plan.service";
import { PlanPrismaRepository } from "./repositories/plan-prisma.repository";

@Module({
    providers: [PlanService, PlanPrismaRepository],
    exports: [PlanService, PlanPrismaRepository],
    imports: [],
})
export class PlanModule {}
