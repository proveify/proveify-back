import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";
import { PrismaClient, Prisma } from "@prisma/client";

export interface TransactionContext {
    transaction: Prisma.TransactionClient;
}

@Injectable()
export class TransactionContextService {
    private readonly asyncLocalStorage = new AsyncLocalStorage<TransactionContext>();

    public getTransaction(): Prisma.TransactionClient | null {
        const context = this.asyncLocalStorage.getStore();
        return context?.transaction ?? null;
    }

    public async runInTransaction<T>(prisma: PrismaClient, callback: () => Promise<T>): Promise<T> {
        return prisma.$transaction(async (transaction) => {
            const context: TransactionContext = { transaction };
            return this.asyncLocalStorage.run(context, callback);
        });
    }
}
