import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthContextService } from "@app/auth/auth-context.service";
import { ProviderQuotePrismaRepository } from "./repositories/provider-quote-prisma.repository";
import {
    CreateProviderQuoteDto,
    UpdateProviderQuoteDto,
    ProviderQuoteParamsDto,
} from "./dto/provider-quote.dto";
import type { Prisma } from "@prisma/client";
import { ProviderQuoteFactory } from "./factories/provider-quote.factory";
import { ProviderQuoteEntity } from "./entities/provider-quote.entity";
import { ProviderQuoteWithIncludes } from "./types/provider-quote.types";

@Injectable()
export class ProviderQuoteService {
    public constructor(
        private providerQuotePrismaRepository: ProviderQuotePrismaRepository,
        private authContextService: AuthContextService,
        private readonly providerQuoteFactory: ProviderQuoteFactory,
    ) {}

    public async create(createDto: CreateProviderQuoteDto): Promise<ProviderQuoteEntity> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const publicRequestExists = await this.providerQuotePrismaRepository.findPublicRequestById(
            createDto.public_request_id,
        );

        if (!publicRequestExists) {
            throw new HttpException("Public request not found", HttpStatus.NOT_FOUND);
        }

        const existingQuote =
            await this.providerQuotePrismaRepository.findByPublicRequestAndProvider(
                createDto.public_request_id,
                provider.id,
            );

        if (existingQuote) {
            throw new HttpException(
                "You have already submitted a quote for this request",
                HttpStatus.CONFLICT,
            );
        }

        const quoteData: Prisma.ProviderQuotesCreateInput = {
            total_price: createDto.total_price,
            description: createDto.description,
            public_request: {
                connect: {
                    id: createDto.public_request_id,
                },
            },
            provider: {
                connect: {
                    id: provider.id,
                },
            },
            provider_quote_items: {
                create: createDto.provider_quote_items.map((item) => ({
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
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

        const result = await this.providerQuotePrismaRepository.createProviderQuote(quoteData);
        return this.providerQuoteFactory.create(result as ProviderQuoteWithIncludes);
    }

    public async findAll(params?: ProviderQuoteParamsDto): Promise<ProviderQuoteEntity[]> {
        const whereConditions: Prisma.ProviderQuotesWhereInput = {};

        if (params?.public_request_id) {
            whereConditions.public_request_id = params.public_request_id;
        }

        if (params?.status) {
            whereConditions.status = params.status;
        }

        const results = await this.providerQuotePrismaRepository.findManyProviderQuotes(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );

        return this.providerQuoteFactory.createMany(results as ProviderQuoteWithIncludes[]);
    }

    public async findOne(id: string): Promise<ProviderQuoteEntity | null> {
        const result = await this.providerQuotePrismaRepository.findUniqueProviderQuote(id);
        return result
            ? this.providerQuoteFactory.create(result as ProviderQuoteWithIncludes)
            : null;
    }

    public async findMyQuotes(params?: ProviderQuoteParamsDto): Promise<ProviderQuoteEntity[]> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const whereConditions: Prisma.ProviderQuotesWhereInput = {
            provider_id: provider.id,
        };

        if (params?.public_request_id) {
            whereConditions.public_request_id = params.public_request_id;
        }

        if (params?.status) {
            whereConditions.status = params.status;
        }

        const results = await this.providerQuotePrismaRepository.findManyProviderQuotes(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );

        return this.providerQuoteFactory.createMany(results as ProviderQuoteWithIncludes[]);
    }

    public async update(
        id: string,
        updateDto: UpdateProviderQuoteDto,
    ): Promise<ProviderQuoteEntity> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const existingQuote =
            await this.providerQuotePrismaRepository.findProviderQuoteByIdOnly(id);

        if (!existingQuote) {
            throw new HttpException("Provider quote not found", HttpStatus.NOT_FOUND);
        }

        if (existingQuote.provider_id !== provider.id) {
            throw new HttpException("You can only update your own quotes", HttpStatus.FORBIDDEN);
        }

        if (existingQuote.status !== "PENDING") {
            throw new HttpException(
                "Cannot update a quote that has been accepted or rejected",
                HttpStatus.BAD_REQUEST,
            );
        }

        const updateData: Prisma.ProviderQuotesUpdateInput = {
            total_price: updateDto.total_price,
            description: updateDto.description,
        };

        if (updateDto.provider_quote_items) {
            updateData.provider_quote_items = {
                deleteMany: {},
                create: updateDto.provider_quote_items.map((item) => ({
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
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

        const result = await this.providerQuotePrismaRepository.updateProviderQuote(id, updateData);
        return this.providerQuoteFactory.create(result as ProviderQuoteWithIncludes);
    }

    public async remove(id: string): Promise<ProviderQuoteEntity> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        const existingQuote =
            await this.providerQuotePrismaRepository.findProviderQuoteByIdOnly(id);

        if (!existingQuote) {
            throw new HttpException("Provider quote not found", HttpStatus.NOT_FOUND);
        }

        if (existingQuote.provider_id !== provider.id) {
            throw new HttpException("You can only delete your own quotes", HttpStatus.FORBIDDEN);
        }

        const result = await this.providerQuotePrismaRepository.deleteProviderQuote(id);
        return this.providerQuoteFactory.create(result as ProviderQuoteWithIncludes);
    }
}
