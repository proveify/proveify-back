import { ParamsDto } from "@app/common/dtos/params.dto";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class PublicRequestParamsDto extends IntersectionType(ParamsDto) {}

export class CreatePublicRequestDto {
    @ApiProperty({
        description: "Título de la solicitud pública",
        example: "Necesito servicios de diseño gráfico",
    })
    @IsString()
    @IsNotEmpty()
    public title: string;

    @ApiProperty({
        description: "Descripción detallada de la solicitud (soporta HTML)",
        type: "string",
        example:
            "<p>Busco diseñador para crear <strong>logo</strong> y <em>identidad corporativa</em> completa.</p><ul><li>Logo principal</li><li>Paleta de colores</li><li>Tipografías</li></ul>",
    })
    @IsString()
    @IsNotEmpty()
    public description: string;
}

export class UpdatePublicRequestDto extends PartialType(CreatePublicRequestDto) {}

export class PublicRequestFilterDto extends IntersectionType(ParamsDto) {
    @ApiProperty({
        description: "Filtrar por ID de usuario específico",
        required: false,
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsUUID()
    public user_id?: string;

    @ApiProperty({
        description: "Buscar en título y descripción",
        required: false,
        example: "diseño",
    })
    @IsOptional()
    @IsString()
    public search?: string;
}
