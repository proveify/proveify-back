import { AuthContextService } from "@app/auth/auth-context.service";
import { PrismaService } from "@app/prisma/prisma.service";
import { HttpException, Injectable } from "@nestjs/common";
import { Prisma, Quotes as QuoteModel } from "@prisma/client";
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

    public async getClientQuotes(): Promise<QuoteModel[]> {
        const userId = this.authContext.getUserId();
        const params: Prisma.QuotesWhereInput = {
            user_id: userId,
        };

        const quotes = await this.getQuotes(params);
        return quotes;
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

    /**
     *
     * @param quote QuoteModel
     * @returns boolean
     * @description Validates if the client or provider is part of the quote
     */
    public validateQuoteUserAndProvider(quote: QuoteModel): boolean {
        const user = this.authContext.getUser();
        const provider = this.authContext.getProvider();

        if (user.id === quote.user_id || provider?.id === quote.provider_id) {
            return true;
        }

        return false;
    }

    public async createQuote(data: QuoteDto, userId?: string): Promise<QuoteModel> {
        const quoteData: Prisma.QuotesCreateInput = {
            Provider: {
                connect: {
                    id: data.provider_id,
                },
            },
            Items: {
                createMany: {
                    data: data.items.map((item) => {
                        return {
                            item_id: item.item_id,
                            quantity: item.quantity,
                            name: item.name,
                            price: item.price,
                            description: item.description,
                            discount: item.discount,
                        };
                    }),
                },
            },
            identification_type: data.identification_type,
            identification: data.identification,
            name: data.name,
            email: data.email,
            description: data.description,
            user_id: userId ?? null,
        };

        return this.saveQuote(quoteData);
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
