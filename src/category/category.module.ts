import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { CategoryPrismaRepository } from "./repositories/category-prisma.repository";

@Module({
    controllers: [CategoryController],
    providers: [CategoryService, CategoryPrismaRepository],
    exports: [CategoryService, CategoryPrismaRepository],
})
export class CategoryModule {}
