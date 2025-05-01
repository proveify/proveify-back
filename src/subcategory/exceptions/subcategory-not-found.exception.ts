import { NotFoundException } from "@nestjs/common";

export class SubcategoryNotFoundException extends NotFoundException {
    public constructor(subcategoryId: string) {
        super(`Subcategory with ID ${subcategoryId} not found`);
    }
}
