import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSubcategoryDto {
    @ApiProperty({ description: "Nombre de la subcategoría" })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({ description: "Descripción de la subcategoría", required: false })
    @IsString()
    @IsOptional()
    public description?: string;

    @ApiProperty({ description: "ID de la categoría a la que pertenece" })
    @IsUUID()
    @IsNotEmpty()
    public id_category: string;
}
