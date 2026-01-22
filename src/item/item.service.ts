import { HttpException, Injectable } from "@nestjs/common";
import { Files as FileModel, Prisma } from "@prisma/client";
import { FavoriteParamsDto, ItemCreateDto, ItemParamDto, ItemUpdateDto } from "./dto/item.dto";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { MemoryStoredFile } from "nestjs-form-data";
import { ItemPrismaRepository } from "./repositories/item-prisma.repository";
import { FavoritePrismaRepository } from "./repositories/favorite-prisma.repository";
import { ItemEntity } from "./entities/item.entity";
import { FavoriteEntity } from "./entities/favorite.entity";
import { ItemFactory } from "@app/item/factories/item.factory";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";
import { generateSlug } from "@app/common/helpers/slug";
import { ItemType } from "@app/item/interfaces/item.interface";

@Injectable()
export class ItemService {
    public constructor(
        private itemPrismaRepository: ItemPrismaRepository,
        private favoritePrismaRepository: FavoritePrismaRepository,
        private cls: ClsService,
        private fileService: FileService,
        private readonly itemFactory: ItemFactory,
    ) {}

    public async prepareCreate(data: ItemCreateDto): Promise<Prisma.ItemsCreateInput> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("User not has provider", 400);
        }

        const item: Prisma.ItemsCreateInput = {
            name: data.name,
            description: data.description,
            type: data.type,
            price: data.price,
            slug: await this.generateItemSlug(data.name),
            provider: { connect: { id: user.provider.id } },
            subcategory: { connect: { id: data.subcategory_id } },
        };

        if (data.images) {
            const uploadedImages = await Promise.all(
                data.images.map((image) => this.uploadImage(image)),
            );

            item.itemImages = {
                createMany: {
                    data: uploadedImages.map((file) => ({
                        file_id: file.id,
                    })),
                },
            };
        }

        return item;
    }

    public async prepareUpdate(data: ItemUpdateDto, id: string): Promise<Prisma.ItemsUpdateInput> {
        const user = this.cls.get<UserEntity>("user");
        const item = await this.findItemById(id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        if (!user.provider) {
            throw new HttpException("User not has provider", 400);
        }

        if (item.provider_id !== user.provider.id) {
            throw new HttpException("You can only update your own items", 403);
        }

        const itemUpdateInput: Prisma.ItemsUpdateInput = {
            name: data.name,
            description: data.description,
            price: data.price,
            type: data.type,
        };

        if (data.images) {
            const images = await Promise.all(
                data.images.map(
                    async (image) => await this.fileService.save(image, ResourceType.ITEM_IMAGE),
                ),
            );

            itemUpdateInput.itemImages = {
                deleteMany: {},
                createMany: {
                    data: images.map((file) => ({
                        file_id: file.id,
                    })),
                },
            };
        }

        return itemUpdateInput;
    }

    public async createItem(item: Prisma.ItemsCreateInput): Promise<ItemEntity> {
        const result = await this.itemPrismaRepository.create({ data: item });
        return this.itemFactory.create(result);
    }

    public async updateItem(item: Prisma.ItemsUpdateInput, id: string): Promise<ItemEntity> {
        const result = await this.itemPrismaRepository.update({ where: { id }, data: item });
        return this.itemFactory.create(result);
    }

    public async deleteItem(id: string): Promise<ItemEntity> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("User not has provider", 400);
        }

        const item = await this.findItemById(id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        if (item.provider_id !== user.provider.id) {
            throw new HttpException("You can only delete your own items", 403);
        }

        const result = await this.itemPrismaRepository.delete({ where: { id } });
        return this.itemFactory.create(result);
    }

    public async findItemById(id: string): Promise<ItemEntity | null> {
        const result = await this.itemPrismaRepository.findUnique({
            where: { id },
            include: { provider: true, itemImages: true },
        });
        return result ? this.itemFactory.create(result) : null;
    }

    public async getItems(params?: ItemParamDto): Promise<ItemEntity[]> {
        const results = await this.itemPrismaRepository.findMany({
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { id: params?.order_by_date ?? "desc" },
            where: {
                type: params?.type,
            },
            include: {
                provider: true,
                itemImages: true,
            },
        });

        return this.itemFactory.createMany(results);
    }

    public async getItemById(id: string): Promise<ItemEntity | null> {
        const item = await this.itemPrismaRepository.findUnique({
            where: { id },
            include: { provider: true, itemImages: true },
        });

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

    public async addFavorite(id: string): Promise<FavoriteEntity> {
        const user = this.cls.get<UserEntity>("user");

        try {
            const result = await this.favoritePrismaRepository.upsert({
                where: { user_id_item_id: { user_id: user.id, item_id: id } },
                update: {},
                create: { user: { connect: { id: user.id } }, item: { connect: { id: id } } },
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

    public async removeFavorite(id: string): Promise<FavoriteEntity> {
        const user = this.cls.get<UserEntity>("user");

        try {
            const result = await this.favoritePrismaRepository.delete({
                where: { user_id_item_id: { user_id: user.id, item_id: id } },
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

    public async getFavorites(params?: FavoriteParamsDto): Promise<FavoriteEntity[]> {
        const user = this.cls.get<UserEntity>("user");

        const results = await this.favoritePrismaRepository.findMany({
            where: { user_id: user.id },
            include: { item: true },
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { created_at: params?.order_by_date ?? "desc" },
        });
        return results.map((favorite) => new FavoriteEntity(favorite));
    }

    public async getProviderItems(id: string, params?: ItemParamDto): Promise<ItemEntity[]> {
        const results = await this.itemPrismaRepository.findMany({
            where: { provider_id: id },
            include: { itemImages: true },
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: { created_at: params?.order_by_date ?? "desc" },
        });

        return this.itemFactory.createMany(results);
    }

    private async generateItemSlug(text: string): Promise<string> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("User not has provider", 400);
        }

        const splitId = user.provider.id.split("-");
        const slug = generateSlug(text) + "-" + splitId[splitId.length - 1];
        const sameSlugs = await this.itemPrismaRepository.getTotalSlug(slug);

        return slug + (sameSlugs > 0 ? `-${(sameSlugs + 1).toString()}` : "");
    }

    public async searchProducts(query: string): Promise<ItemEntity[]> {
        const products = await this.itemPrismaRepository.findByType(query, ItemType.PRODUCT);
        return this.itemFactory.createMany(products);
    }

    public async searchServices(query: string): Promise<ItemEntity[]> {
        const services = await this.itemPrismaRepository.findByType(query, ItemType.SERVICE);
        return this.itemFactory.createMany(services);
    }
}
