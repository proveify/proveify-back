import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Categories as CategoryModel, Prisma } from "@prisma/client";

@Injectable()
export class CategoryPrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async createCategory(data: Prisma.CategoriesCreateInput): Promise<CategoryModel> {
        return this.prisma.categories.create({
            data,
            include: {
                Subcategories: true,
            },
        });
    }

    public async findManyCategories(
        where?: Prisma.CategoriesWhereInput,
        include?: Prisma.CategoriesInclude,
    ): Promise<CategoryModel[]> {
        return this.prisma.categories.findMany({
            where,
            include: include ?? {
                Subcategories: true,
            },
        });
    }

    public async findUniqueCategory(
        id: string,
        include?: Prisma.CategoriesInclude,
    ): Promise<CategoryModel | null> {
        return this.prisma.categories.findUnique({
            where: { id },
            include: include ?? {
                Subcategories: true,
            },
        });
    }

    public async updateCategory(
        id: string,
        data: Prisma.CategoriesUpdateInput,
    ): Promise<CategoryModel> {
        return this.prisma.categories.update({
            where: { id },
            data,
            include: {
                Subcategories: true,
            },
        });
    }

    public async deleteCategory(id: string): Promise<CategoryModel> {
        return this.prisma.categories.delete({
            where: { id },
            include: {
                Subcategories: true,
            },
        });
    }
}