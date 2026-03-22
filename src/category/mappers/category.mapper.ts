import { Injectable } from "@nestjs/common";
import { CategoryFactory, CategoryInput } from "../factories/category.factory";
import {
    SubcategoryFactory,
    SubcategoryInput,
} from "@app/subcategory/factories/subcategory.factory";
import { CategoryEntity } from "../entities/category.entity";
import { SubcategoryEntity } from "@app/subcategory/entities/subcategory.entity";

@Injectable()
export class CategoryMapper {
    public constructor(
        private readonly categoryFactory: CategoryFactory,
        private readonly subcategoryFactory: SubcategoryFactory,
    ) {}

    public toCategoryEntity(data: CategoryInput): CategoryEntity {
        const entity = this.categoryFactory.create(data);

        if ("subcategories" in data) {
            entity.Subcategories = data.subcategories.map((sub) =>
                this.toSubcategoryEntity(sub as SubcategoryInput),
            );
        }

        return entity;
    }

    public toCategoryEntities(data: CategoryInput[]): CategoryEntity[] {
        return data.map((item) => this.toCategoryEntity(item));
    }

    public toSubcategoryEntity(data: SubcategoryInput): SubcategoryEntity {
        const entity = this.subcategoryFactory.create(data);

        if ("category" in data) {
            entity.category = this.toCategoryEntity(data.category as CategoryInput);
        }

        return entity;
    }

    public toSubcategoryEntities(data: SubcategoryInput[]): SubcategoryEntity[] {
        return data.map((item) => this.toSubcategoryEntity(item));
    }
}
