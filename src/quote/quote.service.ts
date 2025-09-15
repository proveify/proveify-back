import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthContextService } from "@app/auth/auth-context.service";
import { QuotePrismaRepository } from "./repositories/quote-prisma.repository";
import { CreateQuoteDto, UpdateQuoteDto, QuoteFilterDto, QuoteParamsDto } from "./dto/quote.dto";
import type { Quotes as QuoteModel, Prisma } from "@prisma/client";

@Injectable()
export class QuoteService {
    public constructor(
        private quotePrismaRepository: QuotePrismaRepository,
        private authContextService: AuthContextService,
    ) {}

    public async create(
        createDto: CreateQuoteDto,
        authenticatedUserId?: string,
    ): Promise<QuoteModel> {
        const providerExists = await this.quotePrismaRepository.findProviderById(
            createDto.provider_id,
        );
        if (!providerExists) {
            throw new HttpException("Provider not found", HttpStatus.NOT_FOUND);
        }

        let userId: string | null = authenticatedUserId ?? null;

        if (!userId) {
            try {
                const user = this.authContextService.getUser();
                userId = user.id;
            } catch {
                console.log("Anonymous user creating quote");
            }
        }

        const quoteData: Prisma.QuotesCreateInput = {
            name: createDto.name,
            email: createDto.email,
            identification: createDto.identification,
            identification_type: createDto.identification_type,
            description: createDto.description,
            user_id: userId,
            provider: {
                connect: {
                    id: createDto.provider_id,
                },
            },
            quote_items: {
                create: createDto.quote_items.map((item) => ({
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    ...(item.item_id && {
                        item: {
                            connect: {
                                id: item.item_id,
                            },
                        },
                    }),
                })),
            },
        };

        return this.quotePrismaRepository.createQuote(quoteData);
    }

    public async findAll(params?: QuoteFilterDto): Promise<QuoteModel[]> {
        const whereConditions: Prisma.QuotesWhereInput = {};

        if (params?.provider_id) {
            whereConditions.provider_id = params.provider_id;
        }

        if (params?.status) {
            whereConditions.status = params.status;
        }

        if (params?.user_id) {
            whereConditions.user_id = params.user_id;
        }

        if (params?.search) {
            whereConditions.OR = [
                {
                    name: {
                        contains: params.search,
                    },
                },
                {
                    email: {
                        contains: params.search,
                    },
                },
                {
                    description: {
                        contains: params.search,
                    },
                },
            ];
        }

        return this.quotePrismaRepository.findManyQuotes(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );
    }

    public async findOne(id: string): Promise<QuoteModel | null> {
        return this.quotePrismaRepository.findUniqueQuote(id);
    }

    public async findMyQuotes(params?: QuoteParamsDto): Promise<QuoteModel[]> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        return this.quotePrismaRepository.findQuotesByProvider(
            provider.id,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );
    }

    public async update(id: string, updateDto: UpdateQuoteDto): Promise<QuoteModel> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const existingQuote = await this.quotePrismaRepository.findQuoteByIdOnly(id);

        if (!existingQuote) {
            throw new HttpException("Quote not found", HttpStatus.NOT_FOUND);
        }

        if (existingQuote.provider_id !== provider.id) {
            throw new HttpException("You can only update your own quotes", HttpStatus.FORBIDDEN);
        }

        const updateData: Prisma.QuotesUpdateInput = {};

        if (updateDto.status) {
            updateData.status = updateDto.status;
        }

        if (updateDto.quote_items) {
            updateData.quote_items = {
                deleteMany: {},
                create: updateDto.quote_items.map((item) => ({
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    ...(item.item_id && {
                        item: {
                            connect: {
                                id: item.item_id,
                            },
                        },
                    }),
                })),
            };
        }

        return this.quotePrismaRepository.updateQuote(id, updateData);
    }

    public async remove(id: string): Promise<QuoteModel> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const existingQuote = await this.quotePrismaRepository.findQuoteByIdOnly(id);

        if (!existingQuote) {
            throw new HttpException("Quote not found", HttpStatus.NOT_FOUND);
        }

        if (existingQuote.provider_id !== provider.id) {
            throw new HttpException("You can only delete your own quotes", HttpStatus.FORBIDDEN);
        }

        return this.quotePrismaRepository.deleteQuote(id);
    }
}
