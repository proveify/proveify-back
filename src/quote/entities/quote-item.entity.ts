import { ApiProperty, ApiHideProperty } from "@nestjs/swagger";
import { ItemEntity } from "@app/item/entities/item.entity";
import { Exclude, Expose } from "class-transformer";
import { Prisma } from "@prisma/client";

export class QuoteItemEntity {
    @ApiProperty({
        description: "ID único del item de cotización",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public id: string;

    @ApiProperty({
        description: "ID de la cotización padre",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public quote_id: string;

    @ApiProperty({
        description: "ID del item del catálogo (opcional)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public item_id: string | null;

    @ApiProperty({
        description: "Nombre del producto/servicio",
        example: "Desarrollo de sitio web",
    })
    public name: string;

    @ApiProperty({
        description: "Descripción específica",
        required: false,
        example: "Sitio web corporativo responsive",
    })
    public description: string | null;

    @ApiProperty({
        description: "Cantidad solicitada",
        example: 1,
    })
    public quantity: number;

    @ApiHideProperty()
    @Exclude()
    public price: Prisma.Decimal;

    @ApiHideProperty()
    @Exclude()
    public unit_price: Prisma.Decimal;

    @ApiProperty({
        description: "Fecha de creación",
        example: "2025-01-28T10:30:00Z",
    })
    public created_at: Date;

    @ApiProperty({
        description: "Fecha de actualización",
        example: "2025-01-28T10:30:00Z",
    })
    public updated_at: Date;

    @ApiProperty({
        type: ItemEntity,
        required: false,
        description: "Información del item del catálogo (si aplica)",
    })
    public item?: ItemEntity;

    public constructor(partial: Partial<QuoteItemEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty({
        description: "Precio total del item (quantity * unit_price)",
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
