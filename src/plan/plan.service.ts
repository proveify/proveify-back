import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { Plans as PlanModel } from "@prisma/client";

@Injectable()
export class PlanService {
    public constructor(private prisma: PrismaService) {}

    public async getPlans(): Promise<PlanModel[]> {
        return this.prisma.plans.findMany();
    }

    public async getPlanByKey(key: string): Promise<PlanModel> {
        return this.prisma.plans.findUniqueOrThrow({
            where: { plan_key: key },
        });
    }
}
