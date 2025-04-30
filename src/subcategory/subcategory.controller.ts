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
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SubcategoryEntity } from "./entities/subcategory.entity";

@ApiTags("Subcategories")
@Controller("subcategories")
export class SubcategoryController {
    public constructor(private readonly subcategoryService: SubcategoryService) {}

    @Post()
    @ApiOperation({ summary: "Create a new subcategory" })
    @ApiResponse({
        status: 201,
        description: "Subcategory created successfully",
        type: SubcategoryEntity,
    })
    public async create(
        @Body() createSubcategoryDto: CreateSubcategoryDto,
    ): Promise<SubcategoryEntity> {
        const subcategory = await this.subcategoryService.create(createSubcategoryDto);
        return new SubcategoryEntity(subcategory);
    }

    @Get()
    @ApiOperation({ summary: "Get all subcategories" })
    @ApiResponse({
        status: 200,
        description: "List of subcategories",
        type: [SubcategoryEntity],
    })
    public async findAll(): Promise<SubcategoryEntity[]> {
        const subcategories = await this.subcategoryService.findAll();
        return subcategories.map((subcategory) => new SubcategoryEntity(subcategory));
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a subcategory by ID" })
    @ApiResponse({
        status: 200,
        description: "Subcategory found",
        type: SubcategoryEntity,
    })
    @ApiResponse({ status: 404, description: "Subcategory not found" })
    public async findOne(@Param("id") id: string): Promise<SubcategoryEntity> {
        const subcategory = await this.subcategoryService.findOne(id);

        if (!subcategory) {
            throw new HttpException("Subcategory not found", HttpStatus.NOT_FOUND);
        }

        return new SubcategoryEntity(subcategory);
    }

    @Get("category/:categoryId")
    @ApiOperation({ summary: "Get subcategories by category ID" })
    @ApiResponse({
        status: 200,
        description: "List of subcategories for the category",
        type: [SubcategoryEntity],
    })
    public async findByCategoryId(
        @Param("categoryId") categoryId: string,
    ): Promise<SubcategoryEntity[]> {
        const subcategories = await this.subcategoryService.findByCategoryId(categoryId);
        return subcategories.map((subcategory) => new SubcategoryEntity(subcategory));
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a subcategory" })
    @ApiResponse({
        status: 200,
        description: "Subcategory updated successfully",
        type: SubcategoryEntity,
    })
    @ApiResponse({ status: 404, description: "Subcategory not found" })
    public async update(
        @Param("id") id: string,
        @Body() updateSubcategoryDto: UpdateSubcategoryDto,
    ): Promise<SubcategoryEntity> {
        const updatedSubcategory = await this.subcategoryService.update(id, updateSubcategoryDto);
        return new SubcategoryEntity(updatedSubcategory);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a subcategory" })
    @ApiResponse({
        status: 200,
        description: "Subcategory deleted successfully",
        type: SubcategoryEntity,
    })
    @ApiResponse({ status: 404, description: "Subcategory not found" })
    public async remove(@Param("id") id: string): Promise<SubcategoryEntity> {
        const deletedSubcategory = await this.subcategoryService.remove(id);
        return new SubcategoryEntity(deletedSubcategory);
    }
}
