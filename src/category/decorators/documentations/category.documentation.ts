import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CategoryEntity } from "../../entities/category.entity";

export function CreateCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Create a new category" }),
        ApiResponse({
            status: 201,
            description: "Category created successfully",
            type: CategoryEntity,
        }),
    );
}

export function GetCategoriesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get all categories with their subcategories" }),
        ApiResponse({
            status: 200,
            description: "List of categories",
            type: [CategoryEntity],
        }),
    );
}

export function GetCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get a category by ID" }),
        ApiResponse({
            status: 200,
            description: "Category found",
            type: CategoryEntity,
        }),
        ApiResponse({ status: 404, description: "Category not found" }),
    );
}

export function UpdateCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Update a category" }),
        ApiResponse({
            status: 200,
            description: "Category updated successfully",
            type: CategoryEntity,
        }),
        ApiResponse({ status: 404, description: "Category not found" }),
    );
}

export function DeleteCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Delete a category" }),
        ApiResponse({
            status: 200,
            description: "Category deleted successfully",
            type: CategoryEntity,
        }),
        ApiResponse({ status: 404, description: "Category not found" }),
    );
}
