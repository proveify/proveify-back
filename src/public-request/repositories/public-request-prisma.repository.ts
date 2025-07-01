import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { PublicRequests as PublicRequestModel, Prisma } from "@prisma/client";

@Injectable()
export class PublicRequestPrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async createPublicRequest(
        data: Prisma.PublicRequestsCreateInput,
    ): Promise<PublicRequestModel> {
        return this.prisma.publicRequests.create({
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
        return this.prisma.publicRequests.findMany({
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

    public async findUniquePublicRequest(id: string): Promise<PublicRequestModel | null> {
        return this.prisma.publicRequests.findUnique({
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
            },
        });
    }

    public async findPublicRequestByIdOnly(id: string): Promise<PublicRequestModel | null> {
        return this.prisma.publicRequests.findUnique({
            where: { id },
        });
    }

    public async updatePublicRequest(
        id: string,
        data: Prisma.PublicRequestsUpdateInput,
    ): Promise<PublicRequestModel> {
        return this.prisma.publicRequests.update({
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
        return this.prisma.publicRequests.delete({
            where: { id },
        });
    }
}
