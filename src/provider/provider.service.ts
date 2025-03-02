import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";

import { Providers as ProviderModel, Prisma } from "@prisma/client";

@Injectable()
export class ProviderService {
    public constructor(private prisma: PrismaService) {}

    public async saveProvider(provider: Prisma.ProvidersCreateInput): Promise<ProviderModel> {
        return this.prisma.providers.create({ data: provider });
    }
}
