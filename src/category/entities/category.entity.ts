import { ApiProperty } from "@nestjs/swagger";
import { SubcategoryEntity } from "@app/subcategory/entities/subcategory.entity";

export class CategoryEntity {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public name: string;

    @ApiProperty({ required: false })
    public description: string | null;

    @ApiProperty()
    public created_at: Date;

    @ApiProperty()
    public updated_at: Date;

    @ApiProperty({ type: [SubcategoryEntity], required: false })
    public Subcategories?: SubcategoryEntity[];

    public constructor(partial: Partial<CategoryEntity>) {
        Object.assign(this, partial);
    }
}
