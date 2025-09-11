import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Providers as ProviderModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class ProviderPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createProvider(data: Prisma.ProvidersCreateInput): Promise<ProviderModel> {
        const prisma = this.getClient();
        return prisma.providers.create({
            data,
            include: {
                plan: true,
                user: true,
            },
        });
    }

    public async findManyProviders(
        where?: Prisma.ProvidersWhereInput,
        take?: number,
        skip?: number,
        orderBy?: Prisma.ProvidersOrderByWithRelationInput,
    ): Promise<ProviderModel[]> {
        const prisma = this.getClient();
        return prisma.providers.findMany({
            where,
            take,
            skip,
            orderBy,
            include: {
                plan: true,
                user: true,
            },
        });
    }

    public async findUniqueProvider(id: string): Promise<ProviderModel | null> {
        const prisma = this.getClient();
        return prisma.providers.findUnique({
            where: { id },
            include: {
                plan: true,
                user: true,
            },
        });
    }

    public async findProvidersByUserId(userId: string): Promise<ProviderModel[]> {
        const prisma = this.getClient();
        return prisma.providers.findMany({
            where: { user_id: userId },
            include: {
                plan: true,
                user: true,
            },
        });
    }

    public async updateProvider(
        id: string,
        data: Prisma.ProvidersUpdateInput,
    ): Promise<ProviderModel> {
        const prisma = this.getClient();
        return prisma.providers.update({
            where: { id },
            data,
            include: {
                plan: true,
                user: true,
            },
        });
    }
}
