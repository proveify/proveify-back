import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Subcategories as SubcategoryModel, Prisma } from "@prisma/client";

@Injectable()
export class SubcategoryPrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async createSubcategory(
        data: Prisma.SubcategoriesCreateInput,
    ): Promise<SubcategoryModel> {
        return this.prisma.subcategories.create({
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
        return this.prisma.subcategories.findMany({
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
        return this.prisma.subcategories.findUnique({
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
        return this.prisma.subcategories.findMany({
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
        return this.prisma.subcategories.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });
    }

    public async deleteSubcategory(id: string): Promise<SubcategoryModel> {
        return this.prisma.subcategories.delete({
            where: { id },
            include: {
                category: true,
            },
        });
    }
}
