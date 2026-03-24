import { Injectable } from "@nestjs/common";
import type { Payments as PaymentModel } from "@prisma/client";
import { PaymentEntity } from "../entities/payment.entity";

export type PaymentEntityInput = PaymentModel & {
    public_key: string;
    integrity_signature: string;
};

@Injectable()
export class PaymentFactory {
    public create(payment: PaymentEntityInput): PaymentEntity {
        return new PaymentEntity({
            ...payment,
            amount_in_cents: payment.amount_in_cents,
            wompi_id: payment.wompi_id ?? null,
        });
    }
}
