import { Injectable } from "@nestjs/common";
import { FileService } from "@app/file/file.service";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { Prisma, Providers as ProviderModel } from "@prisma/client";

export type ProviderInput =
    | Prisma.ProvidersGetPayload<{ include: { user?: true } }>
    | ProviderModel;

@Injectable()
export class ProviderFactory {
    public constructor(private readonly fileService: FileService) {}

    public async create(provider: ProviderInput): Promise<ProviderEntity> {
        const entity = new ProviderEntity({
            id: provider.id,
            rut: provider.rut,
            chamber_commerce: provider.chamber_commerce,
            created_at: provider.created_at,
            plan_id: provider.plan_id,
            user_id: provider.user_id,
            description: provider.description,
        });

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

    public async createMany(providers: ProviderInput[]): Promise<ProviderEntity[]> {
        return Promise.all(providers.map(async (provider) => this.create(provider)));
    }
}
