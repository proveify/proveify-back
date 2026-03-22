import { ApiProperty } from "@nestjs/swagger";
import { CategoryEntity } from "@app/category/entities/category.entity";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class SubcategoryEntity {
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
    public id_category: string;

    @ApiProperty({ required: false })
    @Expose()
    public category?: CategoryEntity;

    @ApiProperty()
    public created_at: Date;

    @ApiProperty()
    public updated_at: Date;

    public constructor(partial: Partial<SubcategoryEntity>) {
        Object.assign(this, partial);
    }
}
