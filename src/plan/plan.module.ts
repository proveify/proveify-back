import { Module } from "@nestjs/common";
import { PlanService } from "./plan.service";
import { PrismaModule } from "@app/prisma/prisma.module";

@Module({
    providers: [PlanService],
    exports: [PlanService],
    imports: [PrismaModule],
})
export class PlanModule {}
