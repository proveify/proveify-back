import { ParamsDto } from "@app/common/dtos/params.dto";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
    IsDecimal,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateIf,
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

    @ApiProperty({
        description: "Precio unitario del item (opcional, para cotizaciones tipo PROVIDER)",
        required: false,
        example: "500000.00",
        type: "string",
    })
    @IsOptional()
    @IsString()
    public unit_price?: string;

    @ApiProperty({
        description: "Precio total del item (opcional, para cotizaciones tipo PROVIDER)",
        required: false,
        example: "2500000.00",
        type: "string",
    })
    @IsOptional()
    @IsString()
    public price?: string;
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
        description: "Nombre completo del solicitante (obligatorio para CLIENT, opcional para PROVIDER)",
        example: "Juan Pérez",
        required: false,
    })
    @ValidateIf((dto: CreateQuoteDto) => dto.type === "CLIENT" || !dto.type)
    @IsString()
    @IsNotEmpty()
    public name?: string;

    @ApiProperty({
        description: "Email de contacto (obligatorio para CLIENT, opcional para PROVIDER)",
        example: "juan.perez@email.com",
        required: false,
    })
    @ValidateIf((dto: CreateQuoteDto) => dto.type === "CLIENT" || !dto.type)
    @IsEmail()
    @IsNotEmpty()
    public email?: string;

    @ApiProperty({
        description: "Número de identificación (obligatorio para CLIENT, opcional para PROVIDER)",
        example: "12345678",
        required: false,
    })
    @ValidateIf((dto: CreateQuoteDto) => dto.type === "CLIENT" || !dto.type)
    @IsString()
    @IsNotEmpty()
    public identification?: string;

    @ApiProperty({
        description: "Tipo de identificación (obligatorio para CLIENT, opcional para PROVIDER)",
        enum: IdentificationTypes,
        example: "CC",
        required: false,
    })
    @ValidateIf((dto: CreateQuoteDto) => dto.type === "CLIENT" || !dto.type)
    @IsString()
    @IsEnum(IdentificationTypes)
    public identification_type?: string;

    @ApiProperty({
        description: "Precio total de la cotización (obligatorio para PROVIDER, opcional para CLIENT)",
        required: false,
        example: "2500000.00",
        type: "string",
    })
    @ValidateIf((dto: CreateQuoteDto) => dto.type === "PROVIDER")
    @IsNotEmpty()
    @IsString()
    public total_price?: string;

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

    @ApiProperty({
        description:
            "Tipo de cotización, CLIENT si la cotización es creada por un cliente (valor por default) y PROVIDER si se trata de cotizaciones hechas para solicitudes publicas",
        example: "CLIENT",
        required: false,
    })
    @IsOptional()
    @IsEnum(["CLIENT", "PROVIDER"])
    public type?: string;

    @ApiProperty({
        description: "ID de solicitud pública para cotizaciones tipo PROVIDER",
        example: "123e4567-e89b-12d3-a456-426614174000",
        required: false,
    })
    @IsString()
    @ValidateIf((dto: CreateQuoteDto) => dto.type === "PROVIDER")
    @IsNotEmpty()
    public public_request_id?: string;
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
        description: "Filtrar por tipo de cotización",
        enum: ["CLIENT", "PROVIDER"],
        required: false,
        example: "PROVIDER",
    })
    @IsOptional()
    @IsString()
    @IsEnum(["CLIENT", "PROVIDER"])
    public type?: string;

    @ApiProperty({
        description: "Filtrar por ID de solicitud pública (solo para cotizaciones tipo PROVIDER)",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsUUID()
    public public_request_id?: string;

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

export class QuoteMessageParamsDto extends IntersectionType(ParamsDto) {
    @IsOptional()
    @IsEnum(["CLIENT", "PROVIDER"])
    @ApiProperty({
        description:
            "Busca el mensaje según si el usuario es un proveedor o cliente, por defecto es cliente",
        enum: ["CLIENT", "PROVIDER"],
        required: false,
    })
    public getAs?: string;
}
