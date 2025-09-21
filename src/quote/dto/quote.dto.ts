import { ParamsDto } from "@app/common/dtos/params.dto";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { IdentificationTypes } from "@app/user/interfaces/users";
import { QuoteStatus } from "../types/quotes";

export class CreateQuoteItemDto {
    @ApiProperty({
        description: "ID del item existente (opcional)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsUUID()
    public item_id?: string;

    @ApiProperty({
        description: "Nombre del producto/servicio",
        example: "Desarrollo de sitio web",
    })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({
        description: "Descripción específica del item",
        required: false,
        example: "Sitio web corporativo con 5 páginas y sistema de contacto",
    })
    @IsOptional()
    @IsString()
    public description?: string;

    @ApiProperty({
        description: "Cantidad solicitada",
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    public quantity: number;
}

export class CreateQuoteDto {
    @ApiProperty({
        description: "ID del proveedor al que se solicita la cotización",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsUUID()
    @IsNotEmpty()
    public provider_id: string;

    @ApiProperty({
        description: "Nombre completo del solicitante",
        example: "Juan Pérez",
    })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({
        description: "Email de contacto",
        example: "juan.perez@email.com",
    })
    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @ApiProperty({
        description: "Número de identificación",
        example: "12345678",
    })
    @IsString()
    @IsNotEmpty()
    public identification: string;

    @ApiProperty({
        description: "Tipo de identificación",
        enum: IdentificationTypes,
        example: "CC",
    })
    @IsString()
    @IsEnum(IdentificationTypes)
    public identification_type: string;

    @ApiProperty({
        description: "Descripción general de la cotización",
        example:
            "Necesito desarrollar un sitio web para mi empresa con funcionalidades específicas",
    })
    @IsString()
    @IsNotEmpty()
    public description: string;

    @ApiProperty({
        description: "Lista de items a cotizar",
        type: [CreateQuoteItemDto],
    })
    @ValidateNested({ each: true })
    @Type(() => CreateQuoteItemDto)
    @IsNotEmpty()
    public quote_items: CreateQuoteItemDto[];
}

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
    @ApiProperty({
        description: "Estado de la cotización",
        enum: QuoteStatus,
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsEnum(QuoteStatus)
    public status?: string;
}

export class QuoteFilterDto extends IntersectionType(ParamsDto) {
    @ApiProperty({
        description: "Filtrar por ID de proveedor específico",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsUUID()
    public provider_id?: string;

    @ApiProperty({
        description: "Filtrar por estado de cotización",
        enum: ["PENDING", "QUOTED", "REJECTED"],
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsEnum(["PENDING", "QUOTED", "REJECTED"])
    public status?: string;

    @ApiProperty({
        description: "Filtrar por ID de usuario (para usuarios registrados)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsUUID()
    public user_id?: string;

    @ApiProperty({
        description: "Buscar en nombre, email o descripción",
        required: false,
        example: "desarrollo web",
    })
    @IsOptional()
    @IsString()
    public search?: string;
}

export class QuoteParamsDto extends IntersectionType(ParamsDto) {}

export class QuoteMessageDto {
    @IsString()
    public content: string;

    @IsUUID()
    public quoteId: string;
}
