import { ParamsDto } from "@app/common/dtos/params.dto";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsDecimal, IsUUID, IsEnum } from "class-validator";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";
import { ItemType } from "@app/item/interfaces/item.interface";

export class ItemParamDto extends IntersectionType(ParamsDto) {
    @IsOptional()
    @IsEnum(ItemType)
    @ApiProperty({
        description: "Tipo de producto",
        example: "PRODUCT",
        enum: ItemType,
    })
    public type?: string;
}

export class ItemCreateDto {
    @IsString()
    public name: string;

    @IsOptional()
    @IsString()
    public description?: string;

    @ApiProperty({
        description: "Tipo de producto",
        example: "PRODUCT",
        enum: ItemType,
    })
    @IsString()
    @IsEnum(ItemType)
    public type: string;

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
