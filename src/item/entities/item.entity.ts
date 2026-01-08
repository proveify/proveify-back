import { Exclude, Expose } from "class-transformer";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { ItemImages } from "@prisma/client";
import { ProviderEntity } from "@app/provider/entities/provider.entity";

@Exclude()
export class ItemEntity {
    @Expose()
    public id: string;

    @Expose()
    public name: string;

    @Expose()
    public description: string | null;

    @Expose()
    @ApiProperty({
        description: "Price of the item in decimal format (max 2 decimal)",
        type: "number",
        example: 16500.99,
        name: "price",
    })
    public price: number;

    @Expose()
    public created_at: Date;

    public updated_at: Date;

    @ApiHideProperty()
    public provider_id: string;

    @ApiHideProperty()
    public itemImages?: ItemImages[];

    @Expose()
    public images: string[];

    @Expose()
    public type: string;

    @ApiProperty({
        description: "Provider of item",
        type: ProviderEntity,
    })
    public provider: ProviderEntity | null = null;

    @ApiProperty({
        description: "Indicates if the item is marked as favorite by the current user",
        required: false,
    })
    @Expose({ groups: ["authenticated"] })
    public is_favorite: boolean;

    public constructor(partial: Partial<ItemEntity>) {
        Object.assign(this, partial);
    }
}
