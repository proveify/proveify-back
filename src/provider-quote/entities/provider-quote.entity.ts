import { ApiProperty, ApiHideProperty } from "@nestjs/swagger";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { PublicRequestEntity } from "@app/public-request/entities/public-request.entity";
import { ItemEntity } from "@app/item/entities/item.entity";
import { Exclude, Expose } from "class-transformer";
import { Prisma } from "@prisma/client";

export class ProviderQuoteItemEntity {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public provider_quote_id: string;

    @ApiProperty({ required: false })
    public item_id: string | null;

    @ApiProperty()
    public name: string;

    @ApiProperty({ required: false })
    public description: string | null;

    @ApiProperty()
    public quantity: number;

    @ApiHideProperty()
    @Exclude()
    public price: Prisma.Decimal;

    @ApiHideProperty()
    @Exclude()
    public unit_price: Prisma.Decimal;

    @ApiProperty()
    public created_at: Date;

    @ApiProperty()
    public updated_at: Date;

    @ApiProperty({ type: ItemEntity, required: false })
    public item?: ItemEntity;

    public constructor(partial: Partial<ProviderQuoteItemEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty({
        description: "Precio total del item",
        type: "number",
        example: 2500000.0,
        name: "price",
    })
    @Expose({ name: "price" })
    public priceFormatted(): number {
        return this.price.toNumber();
    }

    @ApiProperty({
        description: "Precio unitario del item",
        type: "number",
        example: 500000.0,
        name: "unit_price",
    })
    @Expose({ name: "unit_price" })
    public unitPriceFormatted(): number {
        return this.unit_price.toNumber();
    }
}

export class ProviderQuoteEntity {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public public_request_id: string;

    @ApiProperty()
    public provider_id: string;

    @ApiHideProperty()
    @Exclude()
    public total_price: Prisma.Decimal;

    @ApiProperty()
    public description: string;

    @ApiProperty({ enum: ["PENDING", "ACCEPTED", "REJECTED"] })
    public status: string;

    @ApiProperty()
    public created_at: Date;

    @ApiProperty()
    public updated_at: Date;

    @ApiProperty({ type: PublicRequestEntity, required: false })
    public public_request?: PublicRequestEntity;

    @ApiProperty({ type: ProviderEntity, required: false })
    public provider?: ProviderEntity;

    @ApiProperty({ type: [ProviderQuoteItemEntity] })
    public provider_quote_items: ProviderQuoteItemEntity[];

    public constructor(partial: Partial<ProviderQuoteItemEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty({
        description: "Precio total de la cotización",
        type: "number",
        example: 2500000.0,
        name: "total_price",
    })
    @Expose({ name: "total_price" })
    public totalPriceFormatted(): number {
        return this.total_price.toNumber();
    }
}
