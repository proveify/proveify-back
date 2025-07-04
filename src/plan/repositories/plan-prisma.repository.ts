import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Plans as PlanModel, Prisma } from "@prisma/client";

@Injectable()
export class PlanPrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async createPlan(data: Prisma.PlansCreateInput): Promise<PlanModel> {
        return this.prisma.plans.create({ 
            data,
            include: {
                Providers: true,
            },
        });
    }

    public async findManyPlans(): Promise<PlanModel[]> {
        return this.prisma.plans.findMany({
            include: {
                Providers: true,
            },
        });
    }

    public async findUniquePlanByKey(planKey: string): Promise<PlanModel> {
        return this.prisma.plans.findUniqueOrThrow({
            where: { plan_key: planKey },
            include: {
                Providers: true,
            },
        });
    }
}