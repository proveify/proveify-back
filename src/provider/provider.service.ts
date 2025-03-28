import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { ProvidersParamsDto } from "./dto/params.dto";

import { Providers as ProviderModel, Prisma } from "@prisma/client";
import { ProviderUpdateDto } from "./dto/provider.dto";

@Injectable()
export class ProviderService {
    public constructor(private prisma: PrismaService) {}

    public async saveProvider(provider: Prisma.ProvidersCreateInput): Promise<ProviderModel> {
        return this.prisma.providers.create({ data: provider });
    }

    public async getProviders(params?: ProvidersParamsDto): Promise<ProviderModel[]> {
        return this.prisma.providers.findMany({
            take: params?.limit ?? 30,
            skip: params?.offset,
            orderBy: {
                id: params?.order_by ?? "desc",
            },
        });
    }

    public async getProviderById(id: string): Promise<ProviderModel | null> {
        return this.prisma.providers.findUnique({ where: { id } });
    }

    public async providerExists(id: string): Promise<boolean> {
        return (await this.getProviderById(id)) !== null;
    }

    public async updateProvider(id: string, data: ProviderUpdateDto): Promise<ProviderModel> {
        const providerData: Prisma.ProvidersUpdateInput = {};

        if (data.name) providerData.name = data.name;
        if (data.email) providerData.email = data.email;
        if (data.identification) providerData.identification = data.identification;
        if (data.identification_type) providerData.identification_type = data.identification_type;

        return this.prisma.providers.update({
            where: { id },
            data: providerData,
        });
    }
}
