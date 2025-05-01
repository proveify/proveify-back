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
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CategoryEntity } from "./entities/category.entity";

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
    public constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @ApiOperation({ summary: "Create a new category" })
    @ApiResponse({
        status: 201,
        description: "Category created successfully",
        type: CategoryEntity,
    })
    public async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        const category = await this.categoryService.create(createCategoryDto);
        return new CategoryEntity(category);
    }

    @Get()
    @ApiOperation({ summary: "Get all categories with their subcategories" })
    @ApiResponse({
        status: 200,
        description: "List of categories",
        type: [CategoryEntity],
    })
    public async findAll(): Promise<CategoryEntity[]> {
        const categories = await this.categoryService.findAll();
        return categories.map((category) => new CategoryEntity(category));
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a category by ID" })
    @ApiResponse({
        status: 200,
        description: "Category found",
        type: CategoryEntity,
    })
    @ApiResponse({ status: 404, description: "Category not found" })
    public async findOne(@Param("id") id: string): Promise<CategoryEntity> {
        const category = await this.categoryService.findOne(id);
        if (!category) {
            throw new HttpException("Category not found", HttpStatus.NOT_FOUND);
        }
        return new CategoryEntity(category);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a category" })
    @ApiResponse({
        status: 200,
        description: "Category updated successfully",
        type: CategoryEntity,
    })
    @ApiResponse({ status: 404, description: "Category not found" })
    public async update(
        @Param("id") id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryEntity> {
        const updatedCategory = await this.categoryService.update(id, updateCategoryDto);
        return new CategoryEntity(updatedCategory);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a category" })
    @ApiResponse({
        status: 200,
        description: "Category deleted successfully",
        type: CategoryEntity,
    })
    @ApiResponse({ status: 404, description: "Category not found" })
    public async remove(@Param("id") id: string): Promise<CategoryEntity> {
        const deletedCategory = await this.categoryService.remove(id);
        return new CategoryEntity(deletedCategory);
    }
}
