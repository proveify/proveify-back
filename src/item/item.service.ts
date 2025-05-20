import { PrismaService } from "@app/prisma/prisma.service";
import { HttpException, Injectable } from "@nestjs/common";
import {
    Prisma,
    Items as ItemModel,
    Files as FileModel,
    Favorites as FavoriteModel,
} from "@prisma/client";
import { FavoriteParamsDto, ItemCreateDto, ItemParamDto, ItemUpdateDto } from "./dto/item.dto";
import { AuthContextService } from "@app/auth/auth-context.service";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { MemoryStoredFile } from "nestjs-form-data";

@Injectable()
export class ItemService {
    public constructor(
        private prisma: PrismaService,
        private authContextService: AuthContextService,
        private fileService: FileService,
    ) {}

    public async prepareCreate(data: ItemCreateDto): Promise<Prisma.ItemsCreateInput> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User not has provider", 400);
        }

        const item: Prisma.ItemsCreateInput = {
            name: data.name,
            description: data.description,
            price: data.price,
            provider: { connect: { id: provider.id } },
        };

        if (data.image) {
            const image = await this.uploadImage(data.image);
            item.image = image.id;
        }

        return item;
    }

    public async prepareUpdate(data: ItemUpdateDto, id: string): Promise<Prisma.ItemsUpdateInput> {
        const provider = this.authContextService.getProvider();
        const item = await this.findItemById(id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        if (!provider) {
            throw new HttpException("User not has provider", 400);
        }

        const itemUpdateInput: Prisma.ItemsUpdateInput = {
            name: data.name,
            description: data.description,
            price: data.price,
        };

        if (data.image && item.image) {
            const image = await this.uploadImage(data.image, item.image);
            itemUpdateInput.image = image.id;
        } else if (data.image) {
            const image = await this.uploadImage(data.image);
            itemUpdateInput.image = image.id;
        }

        return itemUpdateInput;
    }

    public async createItem(item: Prisma.ItemsCreateInput): Promise<ItemModel> {
        return this.prisma.items.create({ data: item });
    }

    public async updateItem(item: Prisma.ItemsUpdateInput, id: string): Promise<ItemModel> {
        return this.prisma.items.update({ where: { id }, data: item });
    }

    public async deleteItem(id: string): Promise<ItemModel> {
        return this.prisma.items.delete({ where: { id } });
    }

    public async findItemById(id: string): Promise<ItemModel | null> {
        return this.prisma.items.findUnique({ where: { id } });
    }

    public async getItems(params?: ItemParamDto): Promise<ItemModel[]> {
        return this.prisma.items.findMany({
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: {
                id: params?.order_by ?? "desc",
            },
        });
    }

    public async getItemsWithFavoriteInfo(
        params?: ItemParamDto,
        userId?: string,
    ): Promise<(ItemModel & { isFavorite?: boolean })[]> {
        const items = await this.getItems(params);

        if (!userId) {
            return items.map((item) => ({ ...item, isFavorite: false }));
        }

        // Obtener todas las relaciones de favoritos del usuario para estos items
        const favorites = await this.getFavorites(userId, { limit: 1000 });
        const favoriteItemIds = new Set(favorites.map((fav: { item_id: string }) => fav.item_id));

        // Mapear los items con la información de favoritos
        return items.map((item) => ({
            ...item,
            isFavorite: favoriteItemIds.has(item.id),
        }));
    }

    public async findItemByIdWithFavoriteInfo(
        id: string,
        userId?: string,
    ): Promise<(ItemModel & { isFavorite?: boolean }) | null> {
        const item = await this.findItemById(id);

        if (!item) {
            return null;
        }

        if (!userId) {
            return { ...item, isFavorite: false };
        }

        const isFavorite = await this.isFavorite(userId, id);
        return { ...item, isFavorite };
    }

    private async uploadImage(image: MemoryStoredFile, fileId?: string): Promise<FileModel> {
        /**
         * Si existe un fileId, entonces hay que actualizar la imagen
         */
        if (fileId) {
            const file = await this.fileService.getFileById(fileId);

            if (file) {
                const fileUpdated = await this.fileService.update(file, image);
                return fileUpdated.file;
            }
        }

        const file = await this.fileService.save(image, ResourceType.ITEM_IMAGE);

        return file;
    }

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
