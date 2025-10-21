import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { QuotePrismaRepository } from "./repositories/quote-prisma.repository";
import {
    CreateQuoteDto,
    UpdateQuoteDto,
    QuoteFilterDto,
    QuoteParamsDto,
    QuoteMessageParamsDto,
} from "./dto/quote.dto";
import type { Prisma } from "@prisma/client";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { UserTypes } from "@app/user/interfaces/users";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";
import { QuoteFactory } from "@app/quote/factories/quote.factory";
import { QuoteMessageEntity } from "@app/quote/entities/quote-message.entity";
import { PdfService } from "@app/pdf/pdf.service";

@Injectable()
export class QuoteService {
    public constructor(
        private readonly quotePrismaRepository: QuotePrismaRepository,
        private readonly cls: ClsService,
        private readonly quoteFactory: QuoteFactory,
        private readonly pdfService: PdfService,
    ) {}

    public async create(
        createDto: CreateQuoteDto,
        authenticatedUserId?: string,
    ): Promise<QuoteEntity> {
        const providerExists = await this.quotePrismaRepository.findProviderById(
            createDto.provider_id,
        );
        if (!providerExists) {
            throw new HttpException("Provider not found", HttpStatus.NOT_FOUND);
        }

        let userId: string | null = authenticatedUserId ?? null;

        if (!userId) {
            try {
                const user = this.cls.get<UserEntity>("user");
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

        const quote = await this.quotePrismaRepository.createQuote(quoteData);
        return this.quoteFactory.create(quote);
    }

    public async findAll(params?: QuoteFilterDto): Promise<QuoteEntity[]> {
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

        const quotes = await this.quotePrismaRepository.findManyQuotes(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );

        return this.quoteFactory.createMany(quotes);
    }

    public async findOne(id: string): Promise<QuoteEntity | null> {
        const quote = await this.quotePrismaRepository.findUniqueQuote(id);
        if (!quote) return null;
        return this.quoteFactory.create(quote);
    }

    public async findMyQuotes(params?: QuoteParamsDto): Promise<QuoteEntity[]> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const quotes = await this.quotePrismaRepository.findQuotesByProvider(
            user.provider.id,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );

        return this.quoteFactory.createMany(quotes);
    }

    public async update(id: string, updateDto: UpdateQuoteDto): Promise<QuoteEntity> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const existingQuote = await this.quotePrismaRepository.findQuoteByIdOnly(id);

        if (!existingQuote) {
            throw new HttpException("Quote not found", HttpStatus.NOT_FOUND);
        }

        if (existingQuote.provider_id !== user.provider.id) {
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

        const quote = await this.quotePrismaRepository.updateQuote(id, updateData);
        return this.quoteFactory.create(quote);
    }

    public async remove(id: string): Promise<QuoteEntity> {
        const user = this.cls.get<UserEntity>("user");

        if (!user.provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const existingQuote = await this.quotePrismaRepository.findQuoteByIdOnly(id);

        if (!existingQuote) {
            throw new HttpException("Quote not found", HttpStatus.NOT_FOUND);
        }

        if (existingQuote.provider_id !== user.provider.id) {
            throw new HttpException("You can only delete your own quotes", HttpStatus.FORBIDDEN);
        }

        const quote = await this.quotePrismaRepository.deleteQuote(id);
        return this.quoteFactory.create(quote);
    }

    public async getQuoteMessages(
        id: string,
        params: QuoteMessageParamsDto,
    ): Promise<QuoteMessageEntity[]> {
        if (params.getAs === UserTypes.PROVIDER) {
            const user = this.cls.get<UserEntity>("user");

            if (!user.provider) {
                throw new HttpException(
                    "User does not have a provider profile",
                    HttpStatus.FORBIDDEN,
                );
            }

            const providerBelongsToQuote = await this.quotePrismaRepository.providerBelongsToQuote(
                user.provider.id,
                id,
            );

            if (!providerBelongsToQuote) {
                throw new HttpException("Provider does not belong to quote", HttpStatus.FORBIDDEN);
            }
        } else {
            const user = this.cls.get<UserEntity>("user");
            const userBelongsToQuote = await this.quotePrismaRepository.userBelongsToQuote(
                user.id,
                id,
            );

            if (!userBelongsToQuote) {
                throw new HttpException("User does not belong to quote", HttpStatus.FORBIDDEN);
            }
        }

        const quoteMessages = await this.quotePrismaRepository.getQuoteMessages({
            where: {
                quote_id: id,
            },
            take: params.limit ?? 30,
            skip: params.offset,
            orderBy: { created_at: params.order_by ?? "desc" },
        });

        return quoteMessages.map((message) => new QuoteMessageEntity(message));
    }

    public async generatePrint(id: string): Promise<Buffer> {
        const quote = await this.findOne(id);
        // const user = this.cls.get<UserEntity>("user");

        if (!quote) {
            throw new HttpException("Quote not found", HttpStatus.NOT_FOUND);
        }

        if (!quote.provider) {
            throw new HttpException("Provider not found", HttpStatus.NOT_FOUND);
        }

        return this.pdfService.generateQuotePdf(quote, quote.provider);
    }
}
