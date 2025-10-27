import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Items as ItemModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class ItemPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async create(args: Prisma.ItemsCreateArgs): Promise<ItemModel> {
        const prisma = this.getClient();
        return prisma.items.create(args);
    }

    public async findMany(args?: Prisma.ItemsFindManyArgs): Promise<ItemModel[]> {
        const prisma = this.getClient();
        return prisma.items.findMany(args);
    }

    public async findUnique(args: Prisma.ItemsFindUniqueArgs): Promise<ItemModel | null> {
        const prisma = this.getClient();
        return prisma.items.findUnique(args);
    }

    public async update(args: Prisma.ItemsUpdateArgs): Promise<ItemModel> {
        const prisma = this.getClient();
        return prisma.items.update(args);
    }

    public async delete(args: Prisma.ItemsDeleteArgs): Promise<ItemModel> {
        const prisma = this.getClient();
        return prisma.items.delete(args);
    }

    public async getTotalSlug(slug: string): Promise<number> {
        const prisma = this.getClient();
        return prisma.items.count({
            where: {
                slug,
            },
        });
    }
}
