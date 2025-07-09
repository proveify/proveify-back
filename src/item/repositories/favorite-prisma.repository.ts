import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Favorites as FavoriteModel, Prisma } from "@prisma/client";

@Injectable()
export class FavoritePrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async upsert(args: Prisma.FavoritesUpsertArgs): Promise<FavoriteModel> {
        return this.prisma.favorites.upsert(args);
    }

    public async delete(args: Prisma.FavoritesDeleteArgs): Promise<FavoriteModel> {
        return this.prisma.favorites.delete(args);
    }

    public async findMany(args?: Prisma.FavoritesFindManyArgs): Promise<FavoriteModel[]> {
        return this.prisma.favorites.findMany(args);
    }

    public async findFirst(args: Prisma.FavoritesFindFirstArgs): Promise<FavoriteModel | null> {
        return this.prisma.favorites.findFirst(args);
    }

    public async count(args?: Prisma.FavoritesCountArgs): Promise<number> {
        return this.prisma.favorites.count(args);
    }
}
