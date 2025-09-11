import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { firstValueFrom, Observable } from "rxjs";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const existingTransaction = this.transactionContext.getTransaction();

        if (existingTransaction) {
            return next.handle();
        }

        return new Observable((observer): void => {
            this.transactionContext
                .runInTransaction(this.prisma, async (): Promise<unknown> => {
                    return firstValueFrom(next.handle());
                })
                .then((result) => {
                    observer.next(result);
                    observer.complete();
                })
                .catch((error: unknown) => {
                    observer.error(error);
                });
        });
    }
}
