import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ParamsDto } from "@app/configs/dtos/params.dto";
import { IntersectionType } from "@nestjs/swagger";

export class FavoriteCreateDto {
    @ApiProperty({ description: "ID del ítem a marcar como favorito" })
    @IsUUID()
    public item_id: string;
}

export class FavoriteParamsDto extends IntersectionType(ParamsDto) {}
