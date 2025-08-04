import { Module } from "@nestjs/common";
import { SubcategoryController } from "./subcategory.controller";
import { SubcategoryService } from "./subcategory.service";
import { SubcategoryPrismaRepository } from "./repositories/subcategory-prisma.repository";

@Module({
    controllers: [SubcategoryController],
    providers: [SubcategoryService, SubcategoryPrismaRepository],
    exports: [SubcategoryService, SubcategoryPrismaRepository],
})
export class SubcategoryModule {}
