import { ApiProperty } from "@nestjs/swagger";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { QuoteItemEntity } from "@app/quote/entities/quote-item.entity";
import { Exclude, Expose } from "class-transformer";
import { UserEntity } from "@app/user/entities/user.entity";

@Exclude()
export class QuoteEntity {
    @Expose()
    @ApiProperty({
        description: "ID único de la cotización",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public id: string;

    @Expose()
    @ApiProperty({
        description: "ID del proveedor",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public provider_id: string;

    @Expose()
    @ApiProperty({
        description: "Nombre del solicitante",
        example: "Juan Pérez",
    })
    public name: string;

    @Expose()
    @ApiProperty({
        description: "Email de contacto",
        example: "juan.perez@email.com",
    })
    public email: string;

    @Expose()
    @ApiProperty({
        description: "Número de identificación",
        example: "12345678",
    })
    public identification: string;

    @Expose()
    @ApiProperty({
        description: "Tipo de identificación",
        example: "CC",
    })
    public identification_type: string;

    @Expose()
    @ApiProperty({
        description: "ID del usuario registrado (opcional)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public user_id: string | null;

    @Expose()
    @ApiProperty({
        description: "Descripción general de la cotización",
        example: "Necesito desarrollar un sitio web corporativo",
    })
    public description: string;

    @Expose()
    @ApiProperty({
        description: "Estado de la cotización",
        enum: ["PENDING", "QUOTED", "REJECTED"],
        example: "PENDING",
    })
    public status: string;

    @Expose()
    @ApiProperty({
        description: "Fecha de creación",
        example: "2025-01-28T10:30:00Z",
    })
    public created_at: Date;

    @Expose()
    @ApiProperty({
        description: "Fecha de actualización",
        example: "2025-01-28T10:30:00Z",
    })
    public updated_at: Date;

    @Expose()
    @ApiProperty({
        type: ProviderEntity,
        required: false,
        description: "Información del proveedor",
    })
    public provider: UserEntity | null;

    @Expose()
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
            item.price.toString(),
            (item.price * item.quantity).toString(),
        ]);
    }
}
