import { HttpException, Injectable } from "@nestjs/common";
import { Prisma, Files as FileModel } from "@prisma/client";
import { FavoriteParamsDto, ItemCreateDto, ItemParamDto, ItemUpdateDto } from "./dto/item.dto";
import { AuthContextService } from "@app/auth/auth-context.service";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { MemoryStoredFile } from "nestjs-form-data";
import { ItemPrismaRepository } from "./repositories/item-prisma.repository";
import { FavoritePrismaRepository } from "./repositories/favorite-prisma.repository";
import { ItemEntity } from "./entities/item.entity";
import { FavoriteEntity } from "./entities/favorite.entity";

@Injectable()
export class ItemService {
    public constructor(
        private itemPrismaRepository: ItemPrismaRepository,
        private favoritePrismaRepository: FavoritePrismaRepository,
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
            type: data.type,
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

        if (item.provider_id !== provider.id) {
            throw new HttpException("You can only update your own items", 403);
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

    public async createItem(item: Prisma.ItemsCreateInput): Promise<ItemEntity> {
        const result = await this.itemPrismaRepository.create({ data: item });
        return new ItemEntity(result);
    }

    public async updateItem(item: Prisma.ItemsUpdateInput, id: string): Promise<ItemEntity> {
        const result = await this.itemPrismaRepository.update({ where: { id }, data: item });
        return new ItemEntity(result);
    }

    public async deleteItem(id: string): Promise<ItemEntity> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User not has provider", 400);
        }

        const item = await this.findItemById(id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        if (item.provider_id !== provider.id) {
            throw new HttpException("You can only delete your own items", 403);
        }

        const result = await this.itemPrismaRepository.delete({ where: { id } });
        return new ItemEntity(result);
    }

    public async findItemById(id: string): Promise<ItemEntity | null> {
        const result = await this.itemPrismaRepository.findUnique({ where: { id } });
        return result ? new ItemEntity(result) : null;
    }

    public async getItems(params?: ItemParamDto): Promise<ItemEntity[]> {
        const results = await this.itemPrismaRepository.findMany({
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { id: params?.order_by ?? "desc" },
        });
        return results.map((item) => new ItemEntity(item));
    }

    private async createItemEntityWithExtras(
        item: ItemEntity,
        options: { isFavorite?: boolean; includeImageUrl?: boolean } = {},
    ): Promise<ItemEntity> {
        let imageUrl = null;

        if (options.includeImageUrl && item.image) {
            imageUrl = await this.fileService.getFileUrlById(item.image);
        }

        const itemData = {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            created_at: item.created_at,
            updated_at: item.updated_at,
            provider_id: item.provider_id,
            imageUrl,
            isFavorite: options.isFavorite ?? false,
        };

        return new ItemEntity(itemData);
    }

    public async getItemsWithFavoriteInfo(
        params?: ItemParamDto,
        userId?: string,
    ): Promise<ItemEntity[]> {
        const items = await this.getItems(params);

        if (!userId) {
            const itemsWithImages = await Promise.all(
                items.map(async (item) => {
                    return await this.createItemEntityWithExtras(item, {
                        isFavorite: false,
                        includeImageUrl: true,
                    });
                }),
            );
            return itemsWithImages;
        }

        const favorites = await this.getFavorites(userId, { limit: 1000 });
        const favoriteItemIds = new Set(favorites.map((fav) => fav.item_id));

        const itemsWithFavoritesAndImages = await Promise.all(
            items.map(async (item) => {
                const isFavorite = favoriteItemIds.has(item.id);
                return await this.createItemEntityWithExtras(item, {
                    isFavorite,
                    includeImageUrl: true,
                });
            }),
        );

        return itemsWithFavoritesAndImages;
    }

    public async findItemByIdWithFavoriteInfo(
        id: string,
        userId?: string,
    ): Promise<ItemEntity | null> {
        const item = await this.findItemById(id);

        if (!item) {
            return null;
        }

        let isFavorite = false;

        if (userId) {
            isFavorite = await this.isFavorite(userId, id);
        }

        return await this.createItemEntityWithExtras(item, {
            isFavorite,
            includeImageUrl: true,
        });
    }

    private async uploadImage(image: MemoryStoredFile, fileId?: string): Promise<FileModel> {
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

    public async addFavorite(userId: string, itemId: string): Promise<FavoriteEntity> {
        try {
            const result = await this.favoritePrismaRepository.upsert({
                where: { user_id_item_id: { user_id: userId, item_id: itemId } },
                update: {},
                create: { user: { connect: { id: userId } }, item: { connect: { id: itemId } } },
            });
            return new FavoriteEntity(result);
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

    public async removeFavorite(userId: string, itemId: string): Promise<FavoriteEntity> {
        try {
            const result = await this.favoritePrismaRepository.delete({
                where: { user_id_item_id: { user_id: userId, item_id: itemId } },
            });
            return new FavoriteEntity(result);
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
    ): Promise<FavoriteEntity[]> {
        const results = await this.favoritePrismaRepository.findMany({
            where: { user_id: userId },
            include: { item: true },
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { created_at: params?.order_by ?? "desc" },
        });
        return results.map((favorite) => new FavoriteEntity(favorite));
    }

    public async isFavorite(userId: string, itemId: string): Promise<boolean> {
        const favorite = await this.favoritePrismaRepository.findFirst({
            where: {
                user_id: userId,
                item_id: itemId,
            },
        });

        return favorite ? true : false;
    }

    public async getProviderItems(params?: ItemParamDto): Promise<ItemEntity[]> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider account", 400);
        }

        const results = await this.itemPrismaRepository.findMany({
            where: { provider_id: provider.id },
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { created_at: params?.order_by ?? "desc" },
        });

        const itemsWithImages = await Promise.all(
            results.map(async (item) => {
                const itemEntity = new ItemEntity(item);
                return await this.createItemEntityWithExtras(itemEntity, {
                    includeImageUrl: true,
                });
            }),
        );

        return itemsWithImages;
    }

    public async getItemsPublic(params?: ItemParamDto): Promise<ItemEntity[]> {
        const items = await this.getItems(params);

        const itemsWithImages = await Promise.all(
            items.map(async (item) => {
                return await this.createItemEntityWithExtras(item, {
                    isFavorite: false,
                    includeImageUrl: true,
                });
            }),
        );

        return itemsWithImages;
    }

    public async findItemByIdPublic(id: string): Promise<ItemEntity | null> {
        const item = await this.findItemById(id);

        if (!item) {
            return null;
        }

        return await this.createItemEntityWithExtras(item, {
            isFavorite: false,
            includeImageUrl: true,
        });
    }
}
