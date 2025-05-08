import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { SubcategoryService } from "./subcategory.service";
import { CreateSubcategoryDto } from "./dto/create-subcategory.dto";
import { UpdateSubcategoryDto } from "./dto/update-subcategory.dto";
import { ApiTags } from "@nestjs/swagger";
import { SubcategoryEntity } from "./entities/subcategory.entity";
import {
    CreateSubcategoryDocumentation,
    DeleteSubcategoryDocumentation,
    GetSubcategoriesByCategoryDocumentation,
    GetSubcategoriesDocumentation,
    GetSubcategoryDocumentation,
    UpdateSubcategoryDocumentation,
} from "./decorators/documentations/subcategory.documentation";

@ApiTags("Subcategories")
@Controller("subcategories")
export class SubcategoryController {
    public constructor(private readonly subcategoryService: SubcategoryService) {}

    @Post()
    @CreateSubcategoryDocumentation()
    public async create(
        @Body() createSubcategoryDto: CreateSubcategoryDto,
    ): Promise<SubcategoryEntity> {
        const subcategory = await this.subcategoryService.create(createSubcategoryDto);
        return new SubcategoryEntity(subcategory);
    }

    @Get()
    @GetSubcategoriesDocumentation()
    public async findAll(): Promise<SubcategoryEntity[]> {
        const subcategories = await this.subcategoryService.findAll();
        return subcategories.map((subcategory) => new SubcategoryEntity(subcategory));
    }

    @Get(":id")
    @GetSubcategoryDocumentation()
    public async findOne(@Param("id") id: string): Promise<SubcategoryEntity> {
        const subcategory = await this.subcategoryService.findOne(id);

        if (!subcategory) {
            throw new HttpException("Subcategory not found", HttpStatus.NOT_FOUND);
        }

        return new SubcategoryEntity(subcategory);
    }

    @Get("category/:categoryId")
    @GetSubcategoriesByCategoryDocumentation()
    public async findByCategoryId(
        @Param("categoryId") categoryId: string,
    ): Promise<SubcategoryEntity[]> {
        const subcategories = await this.subcategoryService.findByCategoryId(categoryId);
        return subcategories.map((subcategory) => new SubcategoryEntity(subcategory));
    }

    @Patch(":id")
    @UpdateSubcategoryDocumentation()
    public async update(
        @Param("id") id: string,
        @Body() updateSubcategoryDto: UpdateSubcategoryDto,
    ): Promise<SubcategoryEntity> {
        const updatedSubcategory = await this.subcategoryService.update(id, updateSubcategoryDto);
        return new SubcategoryEntity(updatedSubcategory);
    }

    @Delete(":id")
    @DeleteSubcategoryDocumentation()
    public async remove(@Param("id") id: string): Promise<SubcategoryEntity> {
        const deletedSubcategory = await this.subcategoryService.remove(id);
        return new SubcategoryEntity(deletedSubcategory);
    }
}
