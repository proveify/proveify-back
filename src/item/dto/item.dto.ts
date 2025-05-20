import { ParamsDto } from "@app/configs/dtos/params.dto";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsDecimal, IsUUID } from "class-validator";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";

export class ItemParamDto extends IntersectionType(ParamsDto) {}

export class ItemCreateDto {
    @IsString()
    public name: string;

    @IsOptional()
    @IsString()
    public description?: string;

    @IsDecimal({ decimal_digits: "2" })
    @IsOptional()
    public price?: string;

    @IsOptional()
    @IsFile()
    @HasMimeType(["application/jpeg", "image/png"])
    public image?: MemoryStoredFile;
}

export class ItemUpdateDto extends PartialType(ItemCreateDto) {}

export class FavoriteCreateDto {
    @ApiProperty({ description: "ID del ítem a marcar como favorito" })
    @IsUUID()
    public item_id: string;
}

export class FavoriteParamsDto extends IntersectionType(ParamsDto) {}
