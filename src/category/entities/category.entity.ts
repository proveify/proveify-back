import { ApiProperty } from "@nestjs/swagger";
import { SubcategoryEntity } from "@app/subcategory/entities/subcategory.entity";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class CategoryEntity {
    @ApiProperty()
    @Expose()
    public id: string;

    @ApiProperty()
    @Expose()
    public name: string;

    @ApiProperty({ required: false })
    @Expose()
    public description: string | null;

    @ApiProperty()
    public created_at: Date;

    @ApiProperty()
    public updated_at: Date;

    @ApiProperty({ type: [SubcategoryEntity], required: false })
    @Expose()
    public Subcategories?: SubcategoryEntity[];

    public constructor(partial: Partial<CategoryEntity>) {
        Object.assign(this, partial);
    }
}
