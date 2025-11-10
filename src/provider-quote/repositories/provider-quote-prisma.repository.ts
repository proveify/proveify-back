import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type {
    ProviderQuotes as ProviderQuoteModel,
    PublicRequests as PublicRequestModel,
    Prisma,
} from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class ProviderQuotePrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createProviderQuote(
        data: Prisma.ProviderQuotesCreateInput,
    ): Promise<ProviderQuoteModel> {
        const prisma = this.getClient();
        return prisma.providerQuotes.create({
            data,
            include: {
                provider: true,
                public_request: true,
                provider_quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async findManyProviderQuotes(
        where?: Prisma.ProviderQuotesWhereInput,
        take?: number,
        skip?: number,
        orderBy?: Prisma.ProviderQuotesOrderByWithRelationInput,
    ): Promise<ProviderQuoteModel[]> {
        const prisma = this.getClient();
        return prisma.providerQuotes.findMany({
            where,
            include: {
                provider: true,
                public_request: true,
                provider_quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
            take,
            skip,
            orderBy,
        });
    }

    public async findUniqueProviderQuote(id: string): Promise<ProviderQuoteModel | null> {
        const prisma = this.getClient();
        return prisma.providerQuotes.findUnique({
            where: { id },
            include: {
                provider: true,
                public_request: true,
                provider_quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async findProviderQuoteByIdOnly(id: string): Promise<ProviderQuoteModel | null> {
        const prisma = this.getClient();
        return prisma.providerQuotes.findUnique({
            where: { id },
        });
    }

    public async updateProviderQuote(
        id: string,
        data: Prisma.ProviderQuotesUpdateInput,
    ): Promise<ProviderQuoteModel> {
        const prisma = this.getClient();
        return prisma.providerQuotes.update({
            where: { id },
            data,
            include: {
                provider: true,
                public_request: true,
                provider_quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async deleteProviderQuote(id: string): Promise<ProviderQuoteModel> {
        const prisma = this.getClient();
        return prisma.providerQuotes.delete({
            where: { id },
            include: {
                provider: true,
                public_request: true,
                provider_quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async findByPublicRequestAndProvider(
        publicRequestId: string,
        providerId: string,
    ): Promise<ProviderQuoteModel | null> {
        const prisma = this.getClient();
        return prisma.providerQuotes.findUnique({
            where: {
                public_request_id_provider_id: {
                    public_request_id: publicRequestId,
                    provider_id: providerId,
                },
            },
        });
    }

    public async findPublicRequestById(id: string): Promise<PublicRequestModel | null> {
        const prisma = this.getClient();
        return prisma.publicRequests.findUnique({
            where: { id },
        });
    }
}
