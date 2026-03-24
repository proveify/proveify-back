import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PaymentEntity {
    @Expose()
    @ApiProperty({ description: "Payment unique identifier", example: "uuid" })
    public id: string;

    @Expose()
    @ApiProperty({ description: "Unique payment reference sent to Wompi", example: "PRV-1234567890" })
    public reference: string;

    @Expose()
    @ApiProperty({ description: "Wompi transaction ID", example: "wompi-txn-id", required: false })
    public wompi_id: string | null;

    @Expose()
    @ApiProperty({ description: "Amount in cents (COP)", example: 5000000 })
    public amount_in_cents: number;

    @Expose()
    @ApiProperty({ description: "Currency", example: "COP" })
    public currency: string;

    @Expose()
    @ApiProperty({ description: "Payment status", example: "PENDING", enum: ["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"] })
    public status: string;

    @Expose()
    @ApiProperty({ description: "Wompi public key for frontend checkout widget", example: "pub_test_xxx" })
    public public_key: string;

    @Expose()
    @ApiProperty({ description: "Integrity signature (SHA256)", example: "abc123..." })
    public integrity_signature: string;

    @Expose()
    @ApiProperty({ description: "Quote ID associated with this payment", example: "uuid" })
    public quote_id: string;

    @Expose()
    @ApiProperty({ description: "User ID who made the payment", example: "uuid" })
    public user_id: string;

    @Expose()
    @ApiProperty({ description: "Creation timestamp" })
    public created_at: Date;

    @Expose()
    @ApiProperty({ description: "Last update timestamp" })
    public updated_at: Date;

    public constructor(partial: Partial<PaymentEntity>) {
        Object.assign(this, partial);
    }
}
