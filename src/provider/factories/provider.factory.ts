import { Injectable } from "@nestjs/common";
import { FileService } from "@app/file/file.service";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { Providers as ProviderModel } from "@prisma/client";

const providerOptions = {
    isOwner: false,
};

@Injectable()
export class ProviderFactory {
    public constructor(private readonly fileService: FileService) {}

    public async create(
        provider: ProviderModel,
        options = providerOptions,
    ): Promise<ProviderEntity> {
        const entity = new ProviderEntity(provider);

        if (entity.profile_picture) {
            entity.profile_picture = await this.fileService.getFileUrlById(entity.profile_picture);
        }

        if (options.isOwner) {
            Reflect.defineMetadata("custom:serialize-options", { groups: ["owner"] }, entity);
        }

        return entity;
    }

    public async createMany(providers: ProviderModel[]): Promise<ProviderEntity[]> {
        return Promise.all(providers.map(async (provider) => this.create(provider)));
    }
}
