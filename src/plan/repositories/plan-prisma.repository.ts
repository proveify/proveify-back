import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Plans as PlanModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class PlanPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createPlan(data: Prisma.PlansCreateInput): Promise<PlanModel> {
        const prisma = this.getClient();
        return prisma.plans.create({
            data,
            include: {
                Providers: true,
            },
        });
    }

    public async findManyPlans(): Promise<PlanModel[]> {
        const prisma = this.getClient();
        return prisma.plans.findMany({
            include: {
                Providers: true,
            },
        });
    }

    public async findUniquePlanByKey(planKey: string): Promise<PlanModel> {
        const prisma = this.getClient();
        return prisma.plans.findUniqueOrThrow({
            where: { plan_key: planKey },
            include: {
                Providers: true,
            },
        });
    }
}
