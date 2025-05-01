import { AuthContextService } from "@app/auth/auth-context.service";
import { PrismaService } from "@app/prisma/prisma.service";
import { HttpException, Injectable } from "@nestjs/common";
import { Prisma, Quotes as QuoteModel, Quotes_group as QuoteGroupModel } from "@prisma/client";
import { QuoteDto } from "./dto/quote.dto";
import { MemoryStoredFile } from "nestjs-form-data";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";

@Injectable()
export class QuoteService {
    public constructor(
        private prisma: PrismaService,
        private readonly authContext: AuthContextService,
        private fileService: FileService,
    ) {}

    public async getClientQuoteGroups(): Promise<QuoteGroupModel[]> {
        const userId = this.authContext.getUserId();
        const params: Prisma.Quotes_groupWhereInput = {
            user_id: userId,
        };

        const quoteGroups = await this.getQuoteGroups(params);
        return quoteGroups;
    }

    public async getQuoteGroups(
        params?: Prisma.Quotes_groupWhereInput,
    ): Promise<QuoteGroupModel[]> {
        const quoteGroups = await this.prisma.quotes_group.findMany({
            where: params,
            include: {
                Quotes: true,
            },
        });

        return quoteGroups;
    }

    public async getQuotes(params?: Prisma.QuotesWhereInput): Promise<QuoteModel[]> {
        const quotes = await this.prisma.quotes.findMany({
            where: params,
            include: {
                Items: true,
                Provider: true,
            },
        });

        return quotes;
    }

    public async getQuoteById(id: string): Promise<QuoteModel | null> {
        const quote = await this.prisma.quotes.findUnique({
            where: { id },
            include: {
                Items: true,
                Provider: true,
            },
        });

        return quote;
    }

    public async getProviderQuotes(): Promise<QuoteModel[]> {
        const provider = this.authContext.getProvider();

        if (!provider) {
            throw new HttpException("Provider not found", 404);
        }

        const params: Prisma.QuotesWhereInput = {
            provider_id: provider.id,
        };

        const quotes = await this.getQuotes(params);
        return quotes;
    }

    public async createQuoteGroup(data: QuoteDto, userId?: string): Promise<QuoteGroupModel> {
        const quoteGroup: Prisma.Quotes_groupCreateInput = {
            user_id: userId,
            identification_type: data.identification_type,
            identification: data.identification,
            name: data.name,
            email: data.email,
            Quotes: {
                createMany: {
                    data: data.quotes.map((quote) => ({
                        provider_id: quote.provider_id,
                        description: quote.description,
                        Items: {
                            createMany: {
                                data: quote.quotes.map((item) => ({
                                    item_id: item.item_id,
                                    quantity: item.quantity,
                                    price: item.price,
                                    name: item.name,
                                    description: item.description,
                                })),
                            },
                        },
                    })),
                },
            },
        };

        return this.saveQuoteGroup(quoteGroup);
    }

    public async saveQuoteGroup(input: Prisma.Quotes_groupCreateInput): Promise<QuoteGroupModel> {
        return this.prisma.quotes_group.create({
            data: input,
        });
    }

    public async saveQuote(input: Prisma.QuotesCreateInput): Promise<QuoteModel> {
        return this.prisma.quotes.create({
            data: input,
        });
    }

    public async updateQuote(id: string, input: Prisma.QuotesUpdateInput): Promise<QuoteModel> {
        return this.prisma.quotes.update({
            where: { id },
            data: input,
        });
    }

    public async uploadQuoteFile(id: string, file: MemoryStoredFile): Promise<QuoteModel> {
        const fielModel = await this.fileService.save(file, ResourceType.QUOTE);
        const data: Prisma.QuotesUpdateInput = {
            file_id: fielModel.id,
        };

        return this.updateQuote(id, data);
    }
}
