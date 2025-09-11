import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Favorites as FavoriteModel, Prisma } from "@prisma/client";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";
import { TransactionContextService } from "@app/prisma/transaction-context.service";

@Injectable()
export class FavoritePrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async upsert(args: Prisma.FavoritesUpsertArgs): Promise<FavoriteModel> {
        const prisma = this.getClient();
        return prisma.favorites.upsert(args);
    }

    public async delete(args: Prisma.FavoritesDeleteArgs): Promise<FavoriteModel> {
        const prisma = this.getClient();
        return prisma.favorites.delete(args);
    }

    public async findMany(args?: Prisma.FavoritesFindManyArgs): Promise<FavoriteModel[]> {
        const prisma = this.getClient();
        return prisma.favorites.findMany(args);
    }

    public async findFirst(args: Prisma.FavoritesFindFirstArgs): Promise<FavoriteModel | null> {
        const prisma = this.getClient();
        return prisma.favorites.findFirst(args);
    }

    public async count(args?: Prisma.FavoritesCountArgs): Promise<number> {
        const prisma = this.getClient();
        return prisma.favorites.count(args);
    }
}
