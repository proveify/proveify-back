import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import type { Prisma } from "@prisma/client";
import { PaymentPrismaRepository } from "./repositories/payment-prisma.repository";
import { WompiService } from "./wompi.service";
import { PaymentFactory } from "./factories/payment.factory";
import { PaymentEntity } from "./entities/payment.entity";
import { InitiatePaymentDto } from "./dto/payment.dto";
import { UserEntity } from "@app/user/entities/user.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

const CURRENCY = "COP";

type WompiEventData = {
    transaction: {
        id: string;
        reference: string;
        status: string;
        amount_in_cents: number;
    };
};

@Injectable()
export class PaymentService {
    public constructor(
        private readonly paymentPrismaRepository: PaymentPrismaRepository,
        private readonly wompiService: WompiService,
        private readonly paymentFactory: PaymentFactory,
        private readonly cls: ClsService,
    ) {}

    public async initiatePayment(dto: InitiatePaymentDto): Promise<PaymentEntity> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const plan = await this.paymentPrismaRepository.findPlanById(dto.plan_id);

        if (!plan) {
            throw new HttpException("Plan not found", HttpStatus.NOT_FOUND);
        }

        if (plan.price <= 0) {
            throw new HttpException("This plan does not require payment", HttpStatus.BAD_REQUEST);
        }

        const existing = await this.paymentPrismaRepository.findPendingPaymentByProvider(
            user.provider.id,
            dto.plan_id,
        );
        if (existing) {
            throw new HttpException(
                "A pending payment already exists for this plan",
                HttpStatus.CONFLICT,
            );
        }

        const amountInCents = Math.round(plan.price * 100);
        const reference = `PRV-${Date.now()}-${user.provider.id.slice(0, 8)}`;

        const integritySignature = this.wompiService.generateIntegritySignature(
            reference,
            amountInCents,
            CURRENCY,
        );

        const createData: Prisma.PaymentsCreateInput = {
            reference,
            amount_in_cents: amountInCents,
            currency: CURRENCY,
            plan: { connect: { id: dto.plan_id } },
            provider: { connect: { id: user.provider.id } },
        };

        const payment = await this.paymentPrismaRepository.createPayment(createData);

        return this.paymentFactory.create({
            ...payment,
            public_key: this.wompiService.getPublicKey(),
            integrity_signature: integritySignature,
        });
    }

    public async handleWebhookEvent(
        event: string,
        data: WompiEventData,
        timestamp: number,
        checksum: string,
    ): Promise<BasicResponseEntity> {
        const isValid = this.wompiService.verifyWebhookSignature(
            { event, data, timestamp },
            timestamp,
            checksum,
        );

        if (!isValid) {
            throw new HttpException("Invalid webhook signature", HttpStatus.UNAUTHORIZED);
        }

        if (event !== "transaction.updated") {
            return { code: 200, message: "Event ignored" };
        }

        const { transaction } = data;
        const payment = await this.paymentPrismaRepository.findPaymentByReference(
            transaction.reference,
        );

        if (!payment) {
            return { code: 200, message: "Payment reference not found, ignored" };
        }

        await this.paymentPrismaRepository.updatePaymentByReference(transaction.reference, {
            status: transaction.status as Prisma.EnumPaymentStatusFilter["equals"],
            wompi_id: transaction.id,
        });

        return { code: 200, message: "Payment status updated" };
    }

    public async findByReference(reference: string): Promise<PaymentEntity> {
        const payment = await this.paymentPrismaRepository.findPaymentByReference(reference);

        if (!payment) {
            throw new HttpException("Payment not found", HttpStatus.NOT_FOUND);
        }

        return this.paymentFactory.create({
            ...payment,
            public_key: this.wompiService.getPublicKey(),
            integrity_signature: this.wompiService.generateIntegritySignature(
                payment.reference,
                payment.amount_in_cents,
                payment.currency,
            ),
        });
    }
}
