import { ApiProperty, ApiHideProperty } from "@nestjs/swagger";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { QuoteItemEntity } from "@app/quote/entities/quote-item.entity";
import { Exclude, Expose } from "class-transformer";
import { Prisma } from "@prisma/client";

export class QuoteEntity {
    @ApiProperty({
        description: "ID único de la cotización",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public id: string;

    @ApiProperty({
        description: "ID del proveedor",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public provider_id: string;

    @ApiProperty({
        description: "Nombre del solicitante (opcional para cotizaciones tipo PROVIDER)",
        required: false,
        example: "Juan Pérez",
    })
    public name: string | null;

    @ApiProperty({
        description: "Email de contacto (opcional para cotizaciones tipo PROVIDER)",
        required: false,
        example: "juan.perez@email.com",
    })
    public email: string | null;

    @ApiProperty({
        description: "Número de identificación (opcional para cotizaciones tipo PROVIDER)",
        required: false,
        example: "12345678",
    })
    public identification: string | null;

    @ApiProperty({
        description: "Tipo de identificación (opcional para cotizaciones tipo PROVIDER)",
        required: false,
        example: "CC",
    })
    public identification_type: string | null;

    @ApiProperty({
        description: "ID del usuario registrado (opcional)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public user_id: string | null;

    @ApiProperty({
        description: "Tipo de cotización",
        enum: ["CLIENT", "PROVIDER"],
        example: "CLIENT",
    })
    public type: string;

    @ApiHideProperty()
    @Exclude()
    public total_price: Prisma.Decimal | null;

    @ApiProperty({
        description: "Descripción general de la cotización",
        example: "Necesito desarrollar un sitio web corporativo",
    })
    public description: string;

    @ApiProperty({
        description: "Estado de la cotización",
        enum: ["PENDING", "QUOTED", "REJECTED"],
        example: "PENDING",
    })
    public status: string;

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
        type: ProviderEntity,
        required: false,
        description: "Información del proveedor",
    })
    public provider: ProviderEntity | null;

    @ApiProperty({
        type: [QuoteItemEntity],
        description: "Items de la cotización",
    })
    public quote_items: QuoteItemEntity[];

    public constructor(partial: Partial<QuoteEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty({
        description: "Precio total de la cotización (para cotizaciones tipo PROVIDER)",
        type: "number",
        example: 2500000.0,
        name: "total_price",
        required: false,
    })
    @Expose({ name: "total_price" })
    public totalPriceFormatted(): number | null {
        return this.total_price ? this.total_price.toNumber() : null;
    }

    public generateItemsToPrint(): string[][] {
        return this.quote_items.map((item) => [
            item.name,
            item.quantity.toString(),
            item.description ?? "",
            item.price.toString(),
            (item.price.toNumber() * item.quantity).toString(),
        ]);
    }
}
