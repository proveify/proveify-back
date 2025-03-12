import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import type { Prisma } from "@prisma/client";
import { Type } from "class-transformer";

export class ProvidersParamsDto {
    @IsNumber()
    @Min(1)
    @Max(30)
    @IsOptional()
    @Type(() => Number)
    public limit?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    public offset?: number;

    @IsOptional()
    @IsString()
    @IsIn(["asc", "desc"])
    public order_by?: Prisma.SortOrder;
}
