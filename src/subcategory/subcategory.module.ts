import { Module } from "@nestjs/common";
import { SubcategoryController } from "./subcategory.controller";
import { SubcategoryService } from "./subcategory.service";

@Module({
    controllers: [SubcategoryController],
    providers: [SubcategoryService],
    exports: [SubcategoryService],
})
export class SubcategoryModule {}
