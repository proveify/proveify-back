import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Categories as CategoryModel, Prisma } from "@prisma/client";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";
import { TransactionContextService } from "@app/prisma/transaction-context.service";

@Injectable()
export class CategoryPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createCategory(data: Prisma.CategoriesCreateInput): Promise<CategoryModel> {
        const prisma = this.getClient();
        return prisma.categories.create({
            data,
            include: {
                subcategories: true,
            },
        });
    }

    public async findManyCategories(
        where?: Prisma.CategoriesWhereInput,
        include?: Prisma.CategoriesInclude,
    ): Promise<CategoryModel[]> {
        const prisma = this.getClient();
        return prisma.categories.findMany({
            where,
            include: include ?? {
                subcategories: true,
            },
        });
    }

    public async findUniqueCategory(
        id: string,
        include?: Prisma.CategoriesInclude,
    ): Promise<CategoryModel | null> {
        const prisma = this.getClient();
        return prisma.categories.findUnique({
            where: { id },
            include: include ?? {
                subcategories: true,
            },
        });
    }

    public async updateCategory(
        id: string,
        data: Prisma.CategoriesUpdateInput,
    ): Promise<CategoryModel> {
        const prisma = this.getClient();
        return prisma.categories.update({
            where: { id },
            data,
            include: {
                subcategories: true,
            },
        });
    }

    public async deleteCategory(id: string): Promise<CategoryModel> {
        const prisma = this.getClient();
        return prisma.categories.delete({
            where: { id },
            include: {
                subcategories: true,
            },
        });
    }
}
