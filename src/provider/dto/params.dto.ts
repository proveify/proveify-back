import { ParamsDto } from "@app/configs/dtos/params.dto";
import { IntersectionType } from "@nestjs/swagger";

export class ProvidersParamsDto extends IntersectionType(ParamsDto) {}
