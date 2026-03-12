import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PaymentPrismaRepository } from "./repositories/payment-prisma.repository";
import { PaymentFactory } from "./factories/payment.factory";
import { WompiService } from "./wompi.service";

@Module({
    controllers: [PaymentController],
    providers: [PaymentService, PaymentPrismaRepository, PaymentFactory, WompiService],
})
export class PaymentModule {}
