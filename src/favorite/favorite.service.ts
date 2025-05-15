import { Injectable, HttpException } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { Favorites as FavoriteModel, Prisma } from "@prisma/client";
import { FavoriteParamsDto } from "./dto/favorite.dto";

@Injectable()
export class FavoriteService {
    public constructor(private prisma: PrismaService) {}

    public async addFavorite(userId: string, itemId: string): Promise<FavoriteModel> {
        try {
            return await this.prisma.favorites.upsert({
                where: {
                    user_id_item_id: {
                        user_id: userId,
                        item_id: itemId,
                    },
                },
                update: {},
                create: {
                    user: { connect: { id: userId } },
                    item: { connect: { id: itemId } },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    throw new HttpException("Item not found", 404);
                }
                if (error.code === "P2003") {
                    throw new HttpException("Invalid item or user ID", 400);
                }
            }
            throw new HttpException("Failed to add item to favorites", 400);
        }
    }

    public async removeFavorite(userId: string, itemId: string): Promise<FavoriteModel> {
        try {
            return await this.prisma.favorites.delete({
                where: {
                    user_id_item_id: {
                        user_id: userId,
                        item_id: itemId,
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    throw new HttpException("Item not found in favorites", 404);
                }
            }
            throw new HttpException("Failed to remove item from favorites", 400);
        }
    }

    public async getFavorites(
        userId: string,
        params?: FavoriteParamsDto,
    ): Promise<FavoriteModel[]> {
        return await this.prisma.favorites.findMany({
            where: { user_id: userId },
            include: { item: true },
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { created_at: params?.order_by ?? "desc" },
        });
    }

    public async isFavorite(userId: string, itemId: string): Promise<boolean> {
        const count = await this.prisma.favorites.count({
            where: {
                user_id: userId,
                item_id: itemId,
            },
        });
        return count > 0;
    }
}
