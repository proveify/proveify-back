import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type {
    Quotes as QuoteModel,
    Providers as ProviderModel,
    QuoteMessages as QuoteMessageModel,
    Prisma,
} from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class QuotePrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createQuote(data: Prisma.QuotesCreateInput): Promise<QuoteModel> {
        const prisma = this.getClient();
        return prisma.quotes.create({
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
        const prisma = this.getClient();
        return prisma.quotes.findMany({
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
        const prisma = this.getClient();
        return prisma.quotes.findUnique({
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
        const prisma = this.getClient();
        return prisma.quotes.findUnique({
            where: { id },
        });
    }

    public async updateQuote(id: string, data: Prisma.QuotesUpdateInput): Promise<QuoteModel> {
        const prisma = this.getClient();
        return prisma.quotes.update({
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
        const prisma = this.getClient();
        return prisma.quotes.delete({
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
        const prisma = this.getClient();
        return prisma.quotes.findMany({
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

    public async findQuotesByClient(
        userId: string,
        take?: number,
        skip?: number,
        orderBy?: Prisma.QuotesOrderByWithRelationInput,
    ): Promise<QuoteModel[]> {
        const prisma = this.getClient();
        return prisma.quotes.findMany({
            where: { user_id: userId },
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
        const prisma = this.getClient();
        return prisma.quotes.count({
            where: { provider_id: providerId },
        });
    }

    public async findQuotesByStatus(
        status: string,
        take?: number,
        skip?: number,
    ): Promise<QuoteModel[]> {
        const prisma = this.getClient();
        return prisma.quotes.findMany({
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
        const prisma = this.getClient();
        return prisma.providers.findUnique({
            where: { id },
        });
    }

    public async userBelongsToQuote(userId: string, quoteId: string): Promise<boolean> {
        const prisma = this.getClient();
        return prisma.quotes
            .findFirst({
                where: {
                    user_id: userId,
                    id: quoteId,
                },
            })
            .then((quote) => quote?.id === quoteId);
    }

    public async providerBelongsToQuote(providerId: string, quoteId: string): Promise<boolean> {
        const prisma = this.getClient();
        return prisma.quotes
            .findFirst({
                where: {
                    provider_id: providerId,
                    id: quoteId,
                },
            })
            .then((quote) => quote?.id === quoteId);
    }

    public async getQuoteMessages(
        args?: Prisma.QuoteMessagesFindManyArgs,
    ): Promise<QuoteMessageModel[]> {
        const prisma = this.getClient();
        return prisma.quoteMessages.findMany(args);
    }
}
