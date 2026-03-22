import { forwardRef, Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { CategoryPrismaRepository } from "./repositories/category-prisma.repository";
import { CategoryFactory } from "./factories/category.factory";
import { CategoryMapper } from "./mappers/category.mapper";
import { SubcategoryModule } from "@app/subcategory/subcategory.module";

@Module({
    imports: [forwardRef(() => SubcategoryModule)],
    controllers: [CategoryController],
    providers: [CategoryService, CategoryPrismaRepository, CategoryFactory, CategoryMapper],
    exports: [CategoryService, CategoryPrismaRepository, CategoryFactory, CategoryMapper],
})
export class CategoryModule {}
