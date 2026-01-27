import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { defer, firstValueFrom, Observable, from } from "rxjs";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return defer(() => {
            const existingTransaction = this.transactionContext.getTransaction();
            if (existingTransaction) {
                return next.handle();
            }

            return from(
                this.transactionContext.runInTransaction(
                    this.prisma,
                    async (): Promise<unknown> => {
                        return firstValueFrom(next.handle());
                    },
                ),
            );
        });
    }
}
