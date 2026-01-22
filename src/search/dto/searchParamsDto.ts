import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchParamsDto {
    @ApiProperty({
        required: true,
        description: "Search query",
        example: "Maquina de soldar",
    })
    @IsString()
    public query: string;

    @ApiProperty({
        required: false,
        description: "Find only in: PROVIDER, PRODUCT, SERVICE",
        example: "Maquina",
    })
    @IsOptional()
    @IsEnum(["PROVIDER", "PRODUCT", "SERVICE"])
    public find_only?: string;
}
