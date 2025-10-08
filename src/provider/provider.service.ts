import { HttpException, Injectable } from "@nestjs/common";
import { ProviderPrismaRepository } from "./repositories/provider-prisma.repository";
import { ProvidersParamsDto } from "./dto/params.dto";
import { Providers as ProviderModel, Prisma } from "@prisma/client";
import { ProviderUpdateDto } from "./dto/provider.dto";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";

@Injectable()
export class ProviderService {
    public constructor(
        private providerPrismaRepository: ProviderPrismaRepository,
        private fileService: FileService,
        private readonly providerFactory: ProviderFactory,
        private cls: ClsService,
    ) {}

    public async saveProvider(provider: Prisma.ProvidersCreateInput): Promise<ProviderModel> {
        return this.providerPrismaRepository.createProvider(provider);
    }

    public async getProviders(params?: ProvidersParamsDto): Promise<ProviderEntity[]> {
        const providers = await this.providerPrismaRepository.findManyProviders(
            undefined,
            params?.limit ?? 30,
            params?.offset,
            { id: params?.order_by ?? "desc" },
        );

        return this.providerFactory.createMany(providers);
    }

    public async getProviderById(id: string): Promise<ProviderEntity | null> {
        const provider = await this.providerPrismaRepository.findUniqueProvider(id);
        if (!provider) return null;
        return this.providerFactory.create(provider);
    }

    public async updateProvider(data: ProviderUpdateDto): Promise<ProviderEntity> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("Provider not found", 404);
        }

        const providerData: Prisma.ProvidersUpdateInput = {};

        if (data.name) providerData.name = data.name;
        if (data.email) providerData.email = data.email;
        if (data.identification) providerData.identification = data.identification;
        if (data.identification_type) providerData.identification_type = data.identification_type;

        if (data.chamber_commerce) {
            let chamberCommerce = await this.fileService.getFileById(
                user.provider.chamber_commerce,
            );

            if (!chamberCommerce) {
                chamberCommerce = await this.fileService.save(
                    data.chamber_commerce,
                    ResourceType.CHAMBER_COMMERCE,
                );

                providerData.chamber_commerce = chamberCommerce.id;
            } else {
                await this.fileService.update(
                    chamberCommerce,
                    data.chamber_commerce,
                    chamberCommerce.path,
                );
            }
        }

        if (data.rut) {
            let rut = await this.fileService.getFileById(user.provider.rut);

            if (!rut) {
                rut = await this.fileService.save(data.rut, ResourceType.RUT);
                providerData.rut = rut.id;
            } else {
                await this.fileService.update(rut, data.rut, rut.path);
            }
        }

        if (data.profile_picture) {
            let profilePicture = user.provider.profile_picture
                ? await this.fileService.getFileById(user.provider.profile_picture)
                : null;

            if (!profilePicture) {
                profilePicture = await this.fileService.save(
                    data.profile_picture,
                    ResourceType.PROVIDER_PROFILE_PICTURE,
                );
                providerData.profile_picture = profilePicture.id;
            } else {
                await this.fileService.update(
                    profilePicture,
                    data.profile_picture,
                    profilePicture.path,
                );
            }
        }

        const providerUpdated = await this.providerPrismaRepository.updateProvider(
            user.provider.id,
            providerData,
        );

        return this.providerFactory.create(providerUpdated);
    }
}
