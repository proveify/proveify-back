import { Injectable } from "@nestjs/common";
import { SubcategoryPrismaRepository } from "./repositories/subcategory-prisma.repository";
import { CreateSubcategoryDto } from "./dto/create-subcategory.dto";
import { UpdateSubcategoryDto } from "./dto/update-subcategory.dto";
import { Subcategories as SubcategoryModel } from "@prisma/client";

@Injectable()
export class SubcategoryService {
    public constructor(private subcategoryPrismaRepository: SubcategoryPrismaRepository) { }

    public async create(createSubcategoryDto: CreateSubcategoryDto): Promise<SubcategoryModel> {
        const data = {
            name: createSubcategoryDto.name,
            description: createSubcategoryDto.description,
            category: {
                connect: { id: createSubcategoryDto.id_category }
            }
        };
        return this.subcategoryPrismaRepository.createSubcategory(data);
    }

    public async findAll(): Promise<SubcategoryModel[]> {
        return this.subcategoryPrismaRepository.findManySubcategories();
    }

    public async findOne(id: string): Promise<SubcategoryModel | null> {
        return this.subcategoryPrismaRepository.findUniqueSubcategory(id);
    }

    public async findByCategoryId(categoryId: string): Promise<SubcategoryModel[]> {
        return this.subcategoryPrismaRepository.findSubcategoriesByCategory(categoryId);
    }

    public async update(id: string, updateSubcategoryDto: UpdateSubcategoryDto): Promise<SubcategoryModel> {
        const data: any = {
            name: updateSubcategoryDto.name,
            description: updateSubcategoryDto.description,
        };

        if (updateSubcategoryDto.id_category) {
            data.category = { connect: { id: updateSubcategoryDto.id_category } };
        }

        return this.subcategoryPrismaRepository.updateSubcategory(id, data);
    }

    public async remove(id: string): Promise<SubcategoryModel> {
        return this.subcategoryPrismaRepository.deleteSubcategory(id);
    }
}
