import { ParamsDto } from "@app/common/dtos/params.dto";
import { ApiProperty, IntersectionType, OmitType, PartialType } from "@nestjs/swagger";
import {
    IsBoolean,
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
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";

export class CreateQuoteItemDto {
    @ApiProperty({
        description: "ID del item",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsUUID()
    public item_id: string;

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

export class QuoteParamsDto extends IntersectionType(ParamsDto) {
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
        description: "Buscar en nombre o email",
        required: false,
        example: "desarrollo web",
    })
    @IsOptional()
    @IsString()
    public search?: string;

    @IsOptional()
    @IsBoolean()
    public include_item_images?: boolean;
}

export class QuoteParamsProviderDto extends OmitType(QuoteParamsDto, ["provider_id"]) {}

export class QuoteParamsClientDto extends OmitType(QuoteParamsDto, ["user_id"]) {}

export class QuoteMessageDto {
    @IsNotEmpty()
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

export class SentQuoteDto {
    @IsOptional()
    @ApiProperty({
        description: "archivo de cotización",
        required: false,
        type: "string",
        format: "binary",
    })
    @IsFile()
    @HasMimeType(["application/pdf"])
    public file?: MemoryStoredFile;

    @ApiProperty({
        description: "Observaciones adicionales para la cotización",
        required: false,
    })
    @IsOptional()
    @IsString()
    public observation?: string;

    @IsOptional()
    @ApiProperty({
        description: "Indica si se quiere enviar la cotización (por defecto true)",
        required: false,
        default: true,
    })
    @IsBoolean()
    public sent: boolean;
}
