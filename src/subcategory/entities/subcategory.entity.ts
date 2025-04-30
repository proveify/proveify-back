import { ApiProperty } from "@nestjs/swagger";
import { CategoryEntity } from "@app/category/entities/category.entity";

export class SubcategoryEntity {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public name: string;

    @ApiProperty({ required: false })
    public description: string | null;

    @ApiProperty()
    public id_category: string;

    @ApiProperty({ required: false })
    public category?: CategoryEntity;

    @ApiProperty()
    public created_at: Date;

    @ApiProperty()
    public updated_at: Date;

    public constructor(partial: Partial<SubcategoryEntity>) {
        Object.assign(this, partial);
    }
}
