import { Injectable } from "@nestjs/common";
import { FileService } from "@app/file/file.service";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { Providers as ProviderModel } from "@prisma/client";
import { AuthContextService } from "@app/auth/auth-context.service";

@Injectable()
export class ProviderFactory {
    public constructor(
        private readonly fileService: FileService,
        private readonly authContextService: AuthContextService,
    ) {}

    public async create(provider: ProviderModel): Promise<ProviderEntity> {
        const entity = new ProviderEntity(provider);

        if (entity.profile_picture) {
            entity.profile_picture = await this.fileService.getFileUrlById(entity.profile_picture);
        }

        if (this.authContextService.hasUser()) {
            const authUser = this.authContextService.getUser();
            if (authUser.provider?.id === provider.id) {
                Reflect.defineMetadata("custom:serialize-options", { groups: ["owner"] }, entity);
            }
        }

        return entity;
    }

    public async createMany(providers: ProviderModel[]): Promise<ProviderEntity[]> {
        return Promise.all(providers.map(async (provider) => this.create(provider)));
    }
}
