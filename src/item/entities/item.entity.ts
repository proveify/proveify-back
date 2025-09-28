import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";

export class ItemEntity {
    public id: string;

    public name: string;

    public description: string | null;

    @Exclude()
    public image: string | null;

    @Exclude()
    public price: Prisma.Decimal;

    public created_at: Date;

    public updated_at: Date;

    public provider_id: string;

    public image_url: string | null;

    public type: string;

    @ApiProperty({
        description: "Indicates if the item is marked as favorite by the current user",
        required: false,
    })
    public is_favorite?: boolean;

    public constructor(partial: Partial<ItemEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty({
        description: "Price of the item in decimal format (max 2 decimal)",
        type: "number",
    })
    @Expose({ name: "price" })
    public priceFormated(): number {
        return this.price.toNumber();
    }
}
