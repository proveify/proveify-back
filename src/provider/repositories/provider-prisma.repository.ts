import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Providers as ProviderModel, Prisma } from "@prisma/client";

@Injectable()
export class ProviderPrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async createProvider(data: Prisma.ProvidersCreateInput): Promise<ProviderModel> {
        return this.prisma.providers.create({ 
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
        return this.prisma.providers.findMany({
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
        return this.prisma.providers.findUnique({ 
            where: { id },
            include: {
                plan: true,
                user: true,
            },
        });
    }

    public async findProvidersByUserId(userId: string): Promise<ProviderModel[]> {
        return this.prisma.providers.findMany({ 
            where: { user_id: userId },
            include: {
                plan: true,
                user: true,
            },
        });
    }

    public async updateProvider(id: string, data: Prisma.ProvidersUpdateInput): Promise<ProviderModel> {
        return this.prisma.providers.update({
            where: { id },
            data,
            include: {
                plan: true,
                user: true,
            },
        });
    }
}