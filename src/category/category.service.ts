import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import type { Categories } from "@prisma/client";

@Injectable()
export class CategoryService {
    public constructor(private prisma: PrismaService) {}

    public async create(createCategoryDto: CreateCategoryDto): Promise<Categories> {
        return await this.prisma.categories.create({
            data: createCategoryDto,
        });
    }

    public async findAll(): Promise<Categories[]> {
        return await this.prisma.categories.findMany({
            include: {
                Subcategories: true,
            },
        });
    }

    public async findOne(id: string): Promise<Categories | null> {
        return await this.prisma.categories.findUnique({
            where: { id },
            include: {
                Subcategories: true,
            },
        });
    }

    public async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Categories> {
        // Verificar si la categoría existe antes de intentar actualizarla
        const category = await this.findOne(id);
        if (!category) {
            throw new HttpException("Category not found", HttpStatus.NOT_FOUND);
        }

        return await this.prisma.categories.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    public async remove(id: string): Promise<Categories> {
        // Verificar si la categoría existe antes de intentar eliminarla
        const category = await this.findOne(id);
        if (!category) {
            throw new HttpException("Category not found", HttpStatus.NOT_FOUND);
        }

        return await this.prisma.categories.delete({
            where: { id },
        });
    }
}
