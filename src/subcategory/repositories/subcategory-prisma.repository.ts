import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Subcategories as SubcategoryModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class SubcategoryPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createSubcategory(
        data: Prisma.SubcategoriesCreateInput,
    ): Promise<SubcategoryModel> {
        const prisma = this.getClient();
        return prisma.subcategories.create({
            data,
            include: {
                category: true,
            },
        });
    }

    public async findManySubcategories(
        where?: Prisma.SubcategoriesWhereInput,
        include?: Prisma.SubcategoriesInclude,
    ): Promise<SubcategoryModel[]> {
        const prisma = this.getClient();
        return prisma.subcategories.findMany({
            where,
            include: include ?? {
                category: true,
            },
        });
    }

    public async findUniqueSubcategory(
        id: string,
        include?: Prisma.SubcategoriesInclude,
    ): Promise<SubcategoryModel | null> {
        const prisma = this.getClient();
        return prisma.subcategories.findUnique({
            where: { id },
            include: include ?? {
                category: true,
            },
        });
    }

    public async findSubcategoriesByCategory(
        categoryId: string,
        include?: Prisma.SubcategoriesInclude,
    ): Promise<SubcategoryModel[]> {
        const prisma = this.getClient();
        return prisma.subcategories.findMany({
            where: {
                id_category: categoryId,
            },
            include: include ?? {
                category: true,
            },
        });
    }

    public async updateSubcategory(
        id: string,
        data: Prisma.SubcategoriesUpdateInput,
    ): Promise<SubcategoryModel> {
        const prisma = this.getClient();
        return prisma.subcategories.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });
    }

    public async deleteSubcategory(id: string): Promise<SubcategoryModel> {
        const prisma = this.getClient();
        return prisma.subcategories.delete({
            where: { id },
            include: {
                category: true,
            },
        });
    }
}
