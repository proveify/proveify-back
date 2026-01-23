import { Injectable } from "@nestjs/common";
import { FileService } from "@app/file/file.service";
import { Items as ItemModel, Prisma } from "@prisma/client";
import { ItemEntity } from "@app/item/entities/item.entity";
import { FavoritePrismaRepository } from "@app/item/repositories/favorite-prisma.repository";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";
import { ProviderItemEntity } from "@app/item/entities/provider.entity";

type ItemInput =
    | Prisma.ItemsGetPayload<{
          include: { provider: { include: { user: true } }; itemImages: true };
      }>
    | ItemModel;

@Injectable()
export class ItemFactory {
    public constructor(
        private readonly fileService: FileService,
        private readonly cls: ClsService,
        private readonly favoritePrismaRepository: FavoritePrismaRepository,
    ) {}

    public async create(item: ItemInput): Promise<ItemEntity> {
        const provider = new ProviderItemEntity({
            id: item.provider_id,
        });

        if ("provider" in item && "user" in item.provider) {
            provider.name = item.provider.user.name;

            if (item.provider.user.profile_picture_id) {
                provider.profile_picture_url = await this.fileService.getFileUrlById(
                    item.provider.user.profile_picture_id,
                );
            } else {
                provider.profile_picture_url = null;
            }
        }

        const data = {
            ...item,
            price: item.price.toNumber(),
            provider: provider,
        };

        const entity = new ItemEntity(data);

        if (entity.itemImages) {
            const results = await Promise.allSettled(
                entity.itemImages.map(async (image) => {
                    const safeImage = image as { file_id?: string };
                    const fileId = safeImage.file_id;
                    if (typeof fileId === "string") {
                        return await this.fileService.getFileUrlById(fileId);
                    }
                    return null;
                }),
            );

            entity.images = results.reduce<string[]>((acc, result) => {
                if (result.status === "fulfilled" && result.value) {
                    acc.push(result.value);
                }
                return acc;
            }, []);
        }

        const user = this.cls.get<UserEntity | null>("user");

        if (user) {
            entity.is_favorite = await this.favoritePrismaRepository
                .findFirst({
                    where: {
                        user_id: user.id,
                        item_id: entity.id,
                    },
                })
                .then((favorites) => !!favorites);
        }

        return entity;
    }

    public async createMany(items: ItemModel[]): Promise<ItemEntity[]> {
        return await Promise.all(items.map(async (item) => this.create(item)));
    }
}
