import { Injectable } from "@nestjs/common";
import { FileService } from "@app/file/file.service";
import { AuthContextService } from "@app/auth/auth-context.service";
import { Items as ItemModel, Prisma } from "@prisma/client";
import { ItemEntity } from "@app/item/entities/item.entity";
import { ProviderService } from "@app/provider/provider.service";
import { FavoritePrismaRepository } from "@app/item/repositories/favorite-prisma.repository";
import { ProviderFactory } from "@app/provider/factories/provider.factory";

type ItemInput = Prisma.ItemsGetPayload<{ include: { provider: true } }> | ItemModel;

@Injectable()
export class ItemFactory {
    public constructor(
        private readonly fileService: FileService,
        private readonly authContextService: AuthContextService,
        private readonly providerService: ProviderService,
        private readonly favoritePrismaRepository: FavoritePrismaRepository,
        private readonly providerFactory: ProviderFactory,
    ) {}

    public async create(item: ItemInput): Promise<ItemEntity> {
        const data = {
            ...item,
            provider:
                "provider" in item
                    ? await this.providerFactory.create(item.provider)
                    : await this.providerService.getProviderById(item.provider_id),
        };

        const entity = new ItemEntity(data);

        if (entity.image) {
            const url = await this.fileService.getFileUrlById(entity.image);

            if (!url) {
                entity.image_url = url;
            }
        }

        if (this.authContextService.hasUser()) {
            const authUser = this.authContextService.getUser();

            entity.is_favorite = await this.favoritePrismaRepository
                .findFirst({
                    where: {
                        user_id: authUser.id,
                        item_id: entity.id,
                    },
                })
                .then((favorites) => !!favorites);

            Reflect.defineMetadata("custom:serialize-options", { groups: ["owner"] }, entity);
        }

        return entity;
    }

    public async createMany(items: ItemModel[]): Promise<ItemEntity[]> {
        return await Promise.all(items.map(async (item) => this.create(item)));
    }
}
