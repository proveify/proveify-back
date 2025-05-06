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
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiTags } from "@nestjs/swagger";
import { CategoryEntity } from "./entities/category.entity";
import {
    CreateCategoryDocumentation,
    DeleteCategoryDocumentation,
    GetCategoriesDocumentation,
    GetCategoryDocumentation,
    UpdateCategoryDocumentation,
} from "./decorators/documentations/category.documentation";

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
    public constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @CreateCategoryDocumentation()
    public async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        const category = await this.categoryService.create(createCategoryDto);
        return new CategoryEntity(category);
    }

    @Get()
    @GetCategoriesDocumentation()
    public async findAll(): Promise<CategoryEntity[]> {
        const categories = await this.categoryService.findAll();
        return categories.map((category) => new CategoryEntity(category));
    }

    @Get(":id")
    @GetCategoryDocumentation()
    public async findOne(@Param("id") id: string): Promise<CategoryEntity> {
        const category = await this.categoryService.findOne(id);
        if (!category) {
            throw new HttpException("Category not found", HttpStatus.NOT_FOUND);
        }
        return new CategoryEntity(category);
    }

    @Patch(":id")
    @UpdateCategoryDocumentation()
    public async update(
        @Param("id") id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryEntity> {
        const updatedCategory = await this.categoryService.update(id, updateCategoryDto);
        return new CategoryEntity(updatedCategory);
    }

    @Delete(":id")
    @DeleteCategoryDocumentation()
    public async remove(@Param("id") id: string): Promise<CategoryEntity> {
        const deletedCategory = await this.categoryService.remove(id);
        return new CategoryEntity(deletedCategory);
    }
}
