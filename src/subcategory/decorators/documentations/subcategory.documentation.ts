import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SubcategoryEntity } from "../../entities/subcategory.entity";

export function CreateSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Create a new subcategory" }),
        ApiResponse({
            status: 201,
            description: "Subcategory created successfully",
            type: SubcategoryEntity,
        }),
    );
}

export function GetSubcategoriesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get all subcategories" }),
        ApiResponse({
            status: 200,
            description: "List of subcategories",
            type: [SubcategoryEntity],
        }),
    );
}

export function GetSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get a subcategory by ID" }),
        ApiResponse({
            status: 200,
            description: "Subcategory found",
            type: SubcategoryEntity,
        }),
        ApiResponse({ status: 404, description: "Subcategory not found" }),
    );
}

export function GetSubcategoriesByCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get subcategories by category ID" }),
        ApiResponse({
            status: 200,
            description: "List of subcategories for the category",
            type: [SubcategoryEntity],
        }),
    );
}

export function UpdateSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Update a subcategory" }),
        ApiResponse({
            status: 200,
            description: "Subcategory updated successfully",
            type: SubcategoryEntity,
        }),
        ApiResponse({ status: 404, description: "Subcategory not found" }),
    );
}

export function DeleteSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Delete a subcategory" }),
        ApiResponse({
            status: 200,
            description: "Subcategory deleted successfully",
            type: SubcategoryEntity,
        }),
        ApiResponse({ status: 404, description: "Subcategory not found" }),
    );
}
