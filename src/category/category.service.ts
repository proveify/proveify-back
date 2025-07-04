import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CategoryPrismaRepository } from "./repositories/category-prisma.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import type { Categories } from "@prisma/client";

@Injectable()
export class CategoryService {
    public constructor(private categoryPrismaRepository: CategoryPrismaRepository) {}

    public async create(createCategoryDto: CreateCategoryDto): Promise<Categories> {
        return await this.categoryPrismaRepository.createCategory(createCategoryDto);
    }

    public async findAll(): Promise<Categories[]> {
        return await this.categoryPrismaRepository.findManyCategories();
    }

    public async findOne(id: string): Promise<Categories | null> {
        return await this.categoryPrismaRepository.findUniqueCategory(id);
    }

    public async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Categories> {
        // Verificar si la categoría existe antes de intentar actualizarla
        const category = await this.findOne(id);
        if (!category) {
            throw new HttpException("Category not found", HttpStatus.NOT_FOUND);
        }

        return await this.categoryPrismaRepository.updateCategory(id, updateCategoryDto);
    }

    public async remove(id: string): Promise<Categories> {
        // Verificar si la categoría existe antes de intentar eliminarla
        const category = await this.findOne(id);
        if (!category) {
            throw new HttpException("Category not found", HttpStatus.NOT_FOUND);
        }

        return await this.categoryPrismaRepository.deleteCategory(id);
    }
}
