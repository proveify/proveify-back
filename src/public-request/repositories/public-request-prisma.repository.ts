import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { PublicRequests as PublicRequestModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class PublicRequestPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createPublicRequest(
        data: Prisma.PublicRequestsCreateInput,
    ): Promise<PublicRequestModel> {
        const prisma = this.getClient();
        return prisma.publicRequests.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        user_type: true,
                        identification_type: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
            },
        });
    }

    public async findManyPublicRequests(
        where?: Prisma.PublicRequestsWhereInput,
        take?: number,
        skip?: number,
        orderBy?: Prisma.PublicRequestsOrderByWithRelationInput,
    ): Promise<PublicRequestModel[]> {
        const prisma = this.getClient();
        return prisma.publicRequests.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        user_type: true,
                        identification_type: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
            },
            take,
            skip,
            orderBy,
        });
    }

    public async findUniquePublicRequest(
        id: string,
        includeQuotes = false,
    ): Promise<PublicRequestModel | null> {
        const prisma = this.getClient();
        return prisma.publicRequests.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        user_type: true,
                        identification_type: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
                ...(includeQuotes && {
                    Quotes: {
                        include: {
                            provider: true,
                            quote_items: {
                                include: {
                                    item: true,
                                },
                            },
                        },
                    },
                }),
            },
        });
    }

    public async findPublicRequestByIdOnly(id: string): Promise<PublicRequestModel | null> {
        const prisma = this.getClient();
        return prisma.publicRequests.findUnique({
            where: { id },
        });
    }

    public async updatePublicRequest(
        id: string,
        data: Prisma.PublicRequestsUpdateInput,
    ): Promise<PublicRequestModel> {
        const prisma = this.getClient();
        return prisma.publicRequests.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        user_type: true,
                        identification_type: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
            },
        });
    }

    public async deletePublicRequest(id: string): Promise<PublicRequestModel> {
        const prisma = this.getClient();
        return prisma.publicRequests.delete({
            where: { id },
        });
    }
}
