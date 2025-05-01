import { NotFoundException } from "@nestjs/common";

export class CategoryNotFoundException extends NotFoundException {
    public constructor(categoryId: string) {
        super(`Category with ID ${categoryId} not found`);
    }
}
