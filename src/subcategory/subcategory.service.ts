import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { CreateSubcategoryDto } from "./dto/create-subcategory.dto";
import { UpdateSubcategoryDto } from "./dto/update-subcategory.dto";
import { Subcategories as SubcategoryModel } from "@prisma/client";

@Injectable()
export class SubcategoryService {
    public constructor(private prisma: PrismaService) {}

    public async create(createSubcategoryDto: CreateSubcategoryDto): Promise<SubcategoryModel> {
        return this.prisma.subcategories.create({
            data: createSubcategoryDto,
        });
    }

    public async findAll(): Promise<SubcategoryModel[]> {
        return this.prisma.subcategories.findMany({
            include: {
                category: true,
            },
        });
    }

    public async findOne(id: string): Promise<SubcategoryModel | null> {
        return this.prisma.subcategories.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
    }

    public async findByCategoryId(categoryId: string): Promise<SubcategoryModel[]> {
        return this.prisma.subcategories.findMany({
            where: {
                id_category: categoryId,
            },
        });
    }

    public async update(
        id: string,
        updateSubcategoryDto: UpdateSubcategoryDto,
    ): Promise<SubcategoryModel> {
        return this.prisma.subcategories.update({
            where: { id },
            data: updateSubcategoryDto,
        });
    }

    public async remove(id: string): Promise<SubcategoryModel> {
        return this.prisma.subcategories.delete({
            where: { id },
        });
    }
}
