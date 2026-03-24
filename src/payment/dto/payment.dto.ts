import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class InitiatePaymentDto {
    @ApiProperty({ description: "ID of the approved quote to pay", example: "uuid" })
    @IsUUID()
    @IsNotEmpty()
    public quote_id: string;
}
