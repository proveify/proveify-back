import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PaymentEntity {
    @Expose()
    @ApiProperty()
    public id: string;

    @Expose()
    @ApiProperty()
    public reference: string;

    @Expose()
    @ApiProperty({ required: false })
    public wompi_id: string | null;

    @Expose()
    @ApiProperty()
    public amount_in_cents: number;

    @Expose()
    @ApiProperty()
    public currency: string;

    @Expose()
    @ApiProperty({ enum: ["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"] })
    public status: string;

    @Expose()
    @ApiProperty()
    public public_key: string;

    @Expose()
    @ApiProperty()
    public integrity_signature: string;

    @Expose()
    @ApiProperty()
    public plan_id: string;

    @Expose()
    @ApiProperty()
    public provider_id: string;

    @Expose()
    @ApiProperty()
    public created_at: Date;

    @Expose()
    @ApiProperty()
    public updated_at: Date;

    public constructor(partial: Partial<PaymentEntity>) {
        Object.assign(this, partial);
    }
}
