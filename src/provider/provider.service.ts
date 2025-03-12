import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { ProvidersParamsDto } from "./dto/params.dto";

import { Providers as ProviderModel, Prisma } from "@prisma/client";

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
}
