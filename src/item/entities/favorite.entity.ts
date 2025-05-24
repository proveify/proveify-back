import { ApiProperty } from "@nestjs/swagger";
import { ItemEntity } from "@app/item/entities/item.entity";

export class FavoriteEntity {
    @ApiProperty({ description: "Favorite relationship unique identifier" })
    public id: string;

    @ApiProperty({ description: "User ID who marked the item as favorite" })
    public user_id: string;

    @ApiProperty({ description: "ID of the item marked as favorite" })
    public item_id: string;

    @ApiProperty({ description: "Date when the item was marked as favorite" })
    public created_at: Date;

    @ApiProperty({ type: ItemEntity, required: false, description: "Item details" })
    public item?: ItemEntity;

    public constructor(partial: Partial<FavoriteEntity>) {
        Object.assign(this, partial);
    }
}
