import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { Favorites as FavoriteModel, Prisma } from "@prisma/client";
import { FavoriteParamsDto } from "./dto/favorite.dto";

@Injectable()
export class FavoriteService {
    public constructor(private prisma: PrismaService) {}

    public async addFavorite(userId: string, itemId: string): Promise<FavoriteModel> {
        return {} as FavoriteModel;
    }

    public async removeFavorite(userId: string, itemId: string): Promise<FavoriteModel> {
        return {} as FavoriteModel;
    }

    public async getFavorites(userId: string, params?: FavoriteParamsDto): Promise<FavoriteModel[]> {
        return [] as FavoriteModel[];
    }

    public async isFavorite(userId: string, itemId: string): Promise<boolean> {
        return false;
    }
}
