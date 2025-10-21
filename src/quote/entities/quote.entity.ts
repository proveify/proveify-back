import { ApiProperty } from "@nestjs/swagger";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { QuoteItemEntity } from "@app/quote/entities/quote-item.entity";

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
        description: "Nombre del solicitante",
        example: "Juan Pérez",
    })
    public name: string;

    @ApiProperty({
        description: "Email de contacto",
        example: "juan.perez@email.com",
    })
    public email: string;

    @ApiProperty({
        description: "Número de identificación",
        example: "12345678",
    })
    public identification: string;

    @ApiProperty({
        description: "Tipo de identificación",
        example: "CC",
    })
    public identification_type: string;

    @ApiProperty({
        description: "ID del usuario registrado (opcional)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public user_id: string | null;

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

    public generateItemsToPrint(): string[][] {
        return this.quote_items.map((item) => [
            item.name,
            item.quantity.toString(),
            item.description ?? "",
            item.priceFormated().toString(),
            (item.priceFormated() * item.quantity).toString(),
        ]);
    }
}
