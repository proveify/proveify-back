import { Injectable } from "@nestjs/common";
import { FileService } from "@app/file/file.service";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { Providers as ProviderModel } from "@prisma/client";

@Injectable()
export class ProviderFactory {
    public constructor(private readonly fileService: FileService) {}

    public async create(provider: ProviderModel): Promise<ProviderEntity> {
        const entity = new ProviderEntity(provider);

        if (entity.rut) {
            entity.rut_file_url = await this.fileService.getFileUrlById(entity.rut);
        }

        if (entity.chamber_commerce) {
            entity.chamber_commerce_file_url = await this.fileService.getFileUrlById(
                entity.chamber_commerce,
            );
        }

        return entity;
    }

    public async createMany(providers: ProviderModel[]): Promise<ProviderEntity[]> {
        return Promise.all(providers.map(async (provider) => this.create(provider)));
    }
}
