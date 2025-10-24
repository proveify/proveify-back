import { ParamsDto } from "@app/common/dtos/params.dto";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
    IsDecimal,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProviderQuoteItemDto {
    @ApiProperty({
        description: "ID del item del catálogo (opcional)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsUUID()
    public item_id?: string;

    @ApiProperty({
        description: "Nombre del producto/servicio",
        example: "Desarrollo de sitio web corporativo",
    })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({
        description: "Descripción del item",
        required: false,
        example: "Incluye diseño responsive y panel de administración",
    })
    @IsOptional()
    @IsString()
    public description?: string;

    @ApiProperty({
        description: "Cantidad",
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    public quantity: number;

    @ApiProperty({
        description: "Precio total del item (price = unit_price * quantity)",
        example: "2500000.00",
        required: false,
    })
    @IsOptional()
    @IsDecimal({ decimal_digits: "2" })
    public price?: string;

    @ApiProperty({
        description: "Precio unitario",
        example: "2500000.00",
    })
    @IsDecimal({ decimal_digits: "2" })
    @IsNotEmpty()
    public unit_price: string;
}

export class CreateProviderQuoteDto {
    @ApiProperty({
        description: "ID de la solicitud pública",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsUUID()
    @IsNotEmpty()
    public public_request_id: string;

    @ApiProperty({
        description: "Precio total de la cotización",
        example: "2500000.00",
    })
    @IsDecimal({ decimal_digits: "2" })
    @IsNotEmpty()
    public total_price: string;

    @ApiProperty({
        description: "Descripción de la cotización",
        example: "Propuesta para desarrollo de sitio web con las siguientes características...",
    })
    @IsString()
    @IsNotEmpty()
    public description: string;

    @ApiProperty({
        description: "Items de la cotización",
        type: [CreateProviderQuoteItemDto],
    })
    @ValidateNested({ each: true })
    @Type(() => CreateProviderQuoteItemDto)
    @IsNotEmpty()
    public provider_quote_items: CreateProviderQuoteItemDto[];
}

export class UpdateProviderQuoteDto extends PartialType(CreateProviderQuoteDto) {}

export class ProviderQuoteParamsDto extends IntersectionType(ParamsDto) {
    @ApiProperty({
        description: "Filtrar por ID de solicitud pública",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsUUID()
    public public_request_id?: string;

    @ApiProperty({
        description: "Filtrar por estado",
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        required: false,
    })
    @IsOptional()
    @IsString()
    public status?: string;
}
