import { Injectable } from "@nestjs/common";
import type { Prisma, Subcategories as SubcategoryModel } from "@prisma/client";
import { SubcategoryEntity } from "@app/subcategory/entities/subcategory.entity";

export type SubcategoryInput =
    | Prisma.SubcategoriesGetPayload<{
          include: { category: true };
      }>
    | SubcategoryModel;

@Injectable()
export class SubcategoryFactory {
    public create(subcategory: SubcategoryInput): SubcategoryEntity {
        return new SubcategoryEntity({
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            id_category: subcategory.id_category,
            created_at: subcategory.created_at,
            updated_at: subcategory.updated_at,
        });
    }

    public createMany(subcategories: SubcategoryInput[]): SubcategoryEntity[] {
        return subcategories.map((subcategory) => this.create(subcategory));
    }
}
