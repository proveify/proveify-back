import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
    @ApiProperty({ description: "Nombre de la categoría" })
    @IsString()
    @IsNotEmpty()
    public name: string;

    @ApiProperty({ description: "Descripción de la categoría", required: false })
    @IsString()
    @IsOptional()
    public description?: string;
}
