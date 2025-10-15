import { Exclude, Expose } from "class-transformer";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Prisma, ItemImages } from "@prisma/client";
import { ProviderEntity } from "@app/provider/entities/provider.entity";

export class ItemEntity {
    public id: string;

    public name: string;

    public description: string | null;

    @ApiHideProperty()
    @Exclude()
    public price: Prisma.Decimal;

    public created_at: Date;

    public updated_at: Date;

    @ApiHideProperty()
    @Exclude()
    public provider_id: string;

    @ApiHideProperty()
    @Exclude()
    public itemImages?: ItemImages[];

    @Expose()
    public images: string[];

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

    @ApiProperty({
        description: "Price of the item in decimal format (max 2 decimal)",
        type: "number",
        example: 16500.99,
        name: "price",
    })
    @Expose({ name: "price" })
    public priceFormated(): number {
        return this.price.toNumber();
    }
}
