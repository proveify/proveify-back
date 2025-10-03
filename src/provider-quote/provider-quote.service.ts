import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthContextService } from "@app/auth/auth-context.service";
import { ProviderQuotePrismaRepository } from "./repositories/provider-quote-prisma.repository";
import {
    CreateProviderQuoteDto,
    UpdateProviderQuoteDto,
    ProviderQuoteParamsDto,
} from "./dto/provider-quote.dto";
import type { ProviderQuotes as ProviderQuoteModel, Prisma } from "@prisma/client";

@Injectable()
export class ProviderQuoteService {
    public constructor(
        private providerQuotePrismaRepository: ProviderQuotePrismaRepository,
        private authContextService: AuthContextService,
    ) {}

    public async create(createDto: CreateProviderQuoteDto): Promise<ProviderQuoteModel> {
        const provider = this.authContextService.getProvider();

        if (!provider) {
            throw new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN);
        }

        // Verificar que la solicitud pública existe
        const publicRequestExists = await this.providerQuotePrismaRepository.findPublicRequestById(
            createDto.public_request_id,
        );

        if (!publicRequestExists) {
            throw new HttpException("Public request not found", HttpStatus.NOT_FOUND);
        }

        // Verificar que el proveedor no haya cotizado antes
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

        return this.providerQuotePrismaRepository.createProviderQuote(quoteData);
    }

    public async findAll(params?: ProviderQuoteParamsDto): Promise<ProviderQuoteModel[]> {
        const whereConditions: Prisma.ProviderQuotesWhereInput = {};

        if (params?.public_request_id) {
            whereConditions.public_request_id = params.public_request_id;
        }

        if (params?.status) {
            whereConditions.status = params.status;
        }

        return this.providerQuotePrismaRepository.findManyProviderQuotes(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );
    }

    public async findOne(id: string): Promise<ProviderQuoteModel | null> {
        return this.providerQuotePrismaRepository.findUniqueProviderQuote(id);
    }

    public async findMyQuotes(params?: ProviderQuoteParamsDto): Promise<ProviderQuoteModel[]> {
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

        return this.providerQuotePrismaRepository.findManyProviderQuotes(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );
    }

    public async update(
        id: string,
        updateDto: UpdateProviderQuoteDto,
    ): Promise<ProviderQuoteModel> {
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

        return this.providerQuotePrismaRepository.updateProviderQuote(id, updateData);
    }

    public async remove(id: string): Promise<ProviderQuoteModel> {
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

        return this.providerQuotePrismaRepository.deleteProviderQuote(id);
    }
}
