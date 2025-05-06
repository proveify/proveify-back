import { ParamsDto } from "@app/configs/dtos/params.dto";
import { IntersectionType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsDecimal } from "class-validator";
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
