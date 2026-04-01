import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class InitiatePaymentDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    public plan_id: string;
}
