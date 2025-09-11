import { type Prisma } from "@prisma/client";

export interface PrismaRepository {
    getClient(): Prisma.TransactionClient;
}
