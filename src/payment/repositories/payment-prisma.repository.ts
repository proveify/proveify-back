import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Payments as PaymentModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class PaymentPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createPayment(data: Prisma.PaymentsCreateInput): Promise<PaymentModel> {
        const prisma = this.getClient();
        return prisma.payments.create({ data });
    }

    public async findPaymentByReference(reference: string): Promise<PaymentModel | null> {
        const prisma = this.getClient();
        return prisma.payments.findUnique({ where: { reference } });
    }

    public async findPaymentByQuoteId(quoteId: string): Promise<PaymentModel | null> {
        const prisma = this.getClient();
        return prisma.payments.findUnique({ where: { quote_id: quoteId } });
    }

    public async updatePaymentByReference(
        reference: string,
        data: Prisma.PaymentsUpdateInput,
    ): Promise<PaymentModel> {
        const prisma = this.getClient();
        return prisma.payments.update({ where: { reference }, data });
    }

    public async findQuoteById(id: string) {
        const prisma = this.getClient();
        return prisma.quotes.findUnique({
            where: { id },
            include: { quote_items: true },
        });
    }
}
