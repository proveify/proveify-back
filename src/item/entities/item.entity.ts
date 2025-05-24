import type { Prisma } from "@prisma/client";
import { Exclude } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ItemEntity {
    public id: string;
    public name: string;
    public description: string | null;
    public price: Prisma.Decimal;

    @Exclude()
    public image: string | null;

    public imageUrl: string | null;
    public created_at: Date;
    public updated_at: Date;
    public provider_id: string;

    @ApiProperty({
        description: "Indicates if the item is marked as favorite by the current user",
        required: false,
    })
    public isFavorite?: boolean;

    public constructor(partial: Partial<ItemEntity>) {
        Object.assign(this, partial);
    }
}
