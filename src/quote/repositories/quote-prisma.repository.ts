import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Quotes as QuoteModel, Providers as ProviderModel, Prisma } from "@prisma/client";

@Injectable()
export class QuotePrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async createQuote(data: Prisma.QuotesCreateInput): Promise<QuoteModel> {
        return this.prisma.quotes.create({
            data,
            include: {
                provider: true,
                quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async findManyQuotes(
        where?: Prisma.QuotesWhereInput,
        take?: number,
        skip?: number,
        orderBy?: Prisma.QuotesOrderByWithRelationInput,
    ): Promise<QuoteModel[]> {
        return this.prisma.quotes.findMany({
            where,
            include: {
                provider: true,
                quote_items: {
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

    public async findUniqueQuote(id: string): Promise<QuoteModel | null> {
        return this.prisma.quotes.findUnique({
            where: { id },
            include: {
                provider: true,
                quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async findQuoteByIdOnly(id: string): Promise<QuoteModel | null> {
        return this.prisma.quotes.findUnique({
            where: { id },
        });
    }

    public async updateQuote(id: string, data: Prisma.QuotesUpdateInput): Promise<QuoteModel> {
        return this.prisma.quotes.update({
            where: { id },
            data,
            include: {
                provider: true,
                quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async deleteQuote(id: string): Promise<QuoteModel> {
        return this.prisma.quotes.delete({
            where: { id },
            include: {
                provider: true,
                quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    }

    public async findQuotesByProvider(
        providerId: string,
        take?: number,
        skip?: number,
        orderBy?: Prisma.QuotesOrderByWithRelationInput,
    ): Promise<QuoteModel[]> {
        return this.prisma.quotes.findMany({
            where: { provider_id: providerId },
            include: {
                provider: true,
                quote_items: {
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

    public async countQuotesByProvider(providerId: string): Promise<number> {
        return this.prisma.quotes.count({
            where: { provider_id: providerId },
        });
    }

    public async findQuotesByStatus(
        status: string,
        take?: number,
        skip?: number,
    ): Promise<QuoteModel[]> {
        return this.prisma.quotes.findMany({
            where: { status },
            include: {
                provider: true,
                quote_items: {
                    include: {
                        item: true,
                    },
                },
            },
            take,
            skip,
            orderBy: { created_at: "desc" },
        });
    }

    public async findProviderById(id: string): Promise<ProviderModel | null> {
        return this.prisma.providers.findUnique({
            where: { id },
        });
    }
}
