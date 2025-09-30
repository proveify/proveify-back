import { HttpException, Injectable } from "@nestjs/common";
import { Files as FileModel, Prisma } from "@prisma/client";
import { FavoriteParamsDto, ItemCreateDto, ItemParamDto, ItemUpdateDto } from "./dto/item.dto";
import { AuthContextService } from "@app/auth/auth-context.service";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { MemoryStoredFile } from "nestjs-form-data";
import { ItemPrismaRepository } from "./repositories/item-prisma.repository";
import { FavoritePrismaRepository } from "./repositories/favorite-prisma.repository";
import { ItemEntity } from "./entities/item.entity";
import { FavoriteEntity } from "./entities/favorite.entity";
import { ItemFactory } from "@app/item/factories/item.factory";

@Injectable()
export class ItemService {
    public constructor(
        private itemPrismaRepository: ItemPrismaRepository,
        private favoritePrismaRepository: FavoritePrismaRepository,
        private authContextService: AuthContextService,
        private fileService: FileService,
        private readonly itemFactory: ItemFactory,
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
            type: data.type,
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
        return this.itemFactory.create(result);
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
        return this.itemFactory.create(result);
    }

    public async findItemById(id: string): Promise<ItemEntity | null> {
        const result = await this.itemPrismaRepository.findUnique({ where: { id } });
        return result ? this.itemFactory.create(result) : null;
    }

    public async getItems(params?: ItemParamDto): Promise<ItemEntity[]> {
        const results = await this.itemPrismaRepository.findMany({
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { id: params?.order_by ?? "desc" },
            where: {
                type: params?.type,
            },
            include: {
                provider: true,
            },
        });

        return this.itemFactory.createMany(results);
    }

    public async getItemById(id: string): Promise<ItemEntity | null> {
        const item = await this.itemPrismaRepository.findUnique({ where: { id } });
        if (!item) {
            return null;
        }

        return this.itemFactory.create(item);
    }

    private async uploadImage(image: MemoryStoredFile, fileId?: string): Promise<FileModel> {
        if (fileId) {
            const file = await this.fileService.getFileById(fileId);

            if (file) {
                const fileUpdated = await this.fileService.update(file, image);
                return fileUpdated.file;
            }
        }

        return await this.fileService.save(image, ResourceType.ITEM_IMAGE);
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

        return !!favorite;
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
            include: { provider: true },
        });

        return this.itemFactory.createMany(results);
    }
}
