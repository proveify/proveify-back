import { forwardRef, Module } from "@nestjs/common";
import { SubcategoryController } from "./subcategory.controller";
import { SubcategoryService } from "./subcategory.service";
import { SubcategoryPrismaRepository } from "./repositories/subcategory-prisma.repository";
import { SubcategoryFactory } from "./factories/subcategory.factory";
import { CategoryModule } from "@app/category/category.module";

@Module({
    imports: [forwardRef(() => CategoryModule)],
    controllers: [SubcategoryController],
    providers: [SubcategoryService, SubcategoryPrismaRepository, SubcategoryFactory],
    exports: [SubcategoryService, SubcategoryPrismaRepository, SubcategoryFactory],
})
export class SubcategoryModule {}
