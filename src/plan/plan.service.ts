import { Injectable } from "@nestjs/common";
import { PlanPrismaRepository } from "./repositories/plan-prisma.repository";
import { Plans as PlanModel } from "@prisma/client";

@Injectable()
export class PlanService {
    public constructor(private planPrismaRepository: PlanPrismaRepository) {}

    public async getPlans(): Promise<PlanModel[]> {
        return this.planPrismaRepository.findManyPlans();
    }

    public async getPlanByKey(key: string): Promise<PlanModel> {
        return this.planPrismaRepository.findUniquePlanByKey(key);
    }
}
