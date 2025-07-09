import { Injectable } from "@nestjs/common";
import { ProviderPrismaRepository } from "./repositories/provider-prisma.repository";
import { ProvidersParamsDto } from "./dto/params.dto";
import { Providers as ProviderModel, Prisma } from "@prisma/client";
import { ProviderUpdateDto } from "./dto/provider.dto";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { ConfigService } from "@nestjs/config";
import { enviromentsConfig } from "@app/configs/base.config";

@Injectable()
export class ProviderService {
    public constructor(
        private providerPrismaRepository: ProviderPrismaRepository,
        private fileService: FileService,
        private configService: ConfigService<typeof enviromentsConfig, true>,
    ) {}

    public async saveProvider(provider: Prisma.ProvidersCreateInput): Promise<ProviderModel> {
        return this.providerPrismaRepository.createProvider(provider);
    }

    public async getProviders(params?: ProvidersParamsDto): Promise<ProviderModel[]> {
        return this.providerPrismaRepository.findManyProviders(
            undefined,
            params?.limit ?? 30,
            params?.offset,
            { id: params?.order_by ?? "desc" },
        );
    }

    public async getProviderById(id: string): Promise<ProviderModel | null> {
        return this.providerPrismaRepository.findUniqueProvider(id);
    }

    public async updateProvider(
        provider: ProviderModel,
        data: ProviderUpdateDto,
    ): Promise<ProviderModel> {
        const providerData: Prisma.ProvidersUpdateInput = {};

        if (data.name) providerData.name = data.name;
        if (data.email) providerData.email = data.email;
        if (data.identification) providerData.identification = data.identification;
        if (data.identification_type) providerData.identification_type = data.identification_type;

        if (data.chamber_commerce) {
            let chamberCommerce = await this.fileService.getFileById(provider.chamber_commerce);

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
            let rut = await this.fileService.getFileById(provider.rut);

            if (!rut) {
                rut = await this.fileService.save(data.rut, ResourceType.RUT);
            } else {
                await this.fileService.update(rut, data.rut, rut.path);
            }
        }

        return this.providerPrismaRepository.updateProvider(provider.id, providerData);
    }

    public async getProvidersByUserId(id: string): Promise<ProviderModel[]> {
        return this.providerPrismaRepository.findProvidersByUserId(id);
    }
}
