import { Injectable } from "@nestjs/common";
import type { Prisma, Categories as CategoryModel } from "@prisma/client";
import { CategoryEntity } from "@app/category/entities/category.entity";

export type CategoryInput =
    | Prisma.CategoriesGetPayload<{
          include: { subcategories: true };
      }>
    | CategoryModel;

@Injectable()
export class CategoryFactory {
    public create(category: CategoryInput): CategoryEntity {
        return new CategoryEntity({
            id: category.id,
            name: category.name,
            description: category.description,
            created_at: category.created_at,
            updated_at: category.updated_at,
        });
    }

    public createMany(categories: CategoryInput[]): CategoryEntity[] {
        return categories.map((category) => this.create(category));
    }
}
