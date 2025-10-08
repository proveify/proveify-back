import { Injectable } from "@nestjs/common";
import { FileService } from "@app/file/file.service";
import { Items as ItemModel, Prisma } from "@prisma/client";
import { ItemEntity } from "@app/item/entities/item.entity";
import { FavoritePrismaRepository } from "@app/item/repositories/favorite-prisma.repository";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";

type ItemInput =
    | Prisma.ItemsGetPayload<{ include: { provider: true; itemImages: true } }>
    | ItemModel;

@Injectable()
export class ItemFactory {
    public constructor(
        private readonly fileService: FileService,
        private readonly cls: ClsService,
        private readonly favoritePrismaRepository: FavoritePrismaRepository,
        private readonly providerFactory: ProviderFactory,
    ) {}

    public async create(item: ItemInput): Promise<ItemEntity> {
        const data = {
            ...item,
            provider: "provider" in item ? await this.providerFactory.create(item.provider) : null,
        };

        const entity = new ItemEntity(data);

        if (entity.itemImages) {
            const results = await Promise.allSettled(
                entity.itemImages.map(async (image) => {
                    return await this.fileService.getFileUrlById(image.id);
                }),
            );

            entity.images = results.reduce<string[]>((acc, result) => {
                if (result.status === "fulfilled" && result.value) {
                    acc.push(result.value);
                }
                return acc;
            }, []);
        }

        if (this.cls.get<UserEntity | null>("user")) {
            const authUser = this.cls.get<UserEntity>("user");

            entity.is_favorite = await this.favoritePrismaRepository
                .findFirst({
                    where: {
                        user_id: authUser.id,
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
