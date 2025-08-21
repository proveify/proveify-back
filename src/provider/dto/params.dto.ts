import { ParamsDto } from "@app/common/dtos/params.dto";
import { IntersectionType } from "@nestjs/swagger";

export class ProvidersParamsDto extends IntersectionType(ParamsDto) {}
