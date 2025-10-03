import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthContextService } from "@app/auth/auth-context.service";
import { PublicRequestPrismaRepository } from "./repositories/public-request-prisma.repository";
import {
    CreatePublicRequestDto,
    UpdatePublicRequestDto,
    PublicRequestParamsDto,
    PublicRequestFilterDto,
} from "./dto/public-request.dto";
import type { PublicRequests as PublicRequestModel, Prisma } from "@prisma/client";
import { ProviderQuoteService } from "@app/provider-quote/provider-quote.service";
import type { ProviderQuotes as ProviderQuoteModel } from "@prisma/client";

@Injectable()
export class PublicRequestService {
    public constructor(
        private publicRequestPrismaRepository: PublicRequestPrismaRepository,
        private authContextService: AuthContextService,
        private providerQuoteService: ProviderQuoteService,
    ) {}

    public async create(createDto: CreatePublicRequestDto): Promise<PublicRequestModel> {
        const user = this.authContextService.getUser();

        const publicRequestData: Prisma.PublicRequestsCreateInput = {
            title: createDto.title,
            description: createDto.description,
            user: {
                connect: {
                    id: user.id,
                },
            },
        };

        return this.publicRequestPrismaRepository.createPublicRequest(publicRequestData);
    }

    public async findAll(params?: PublicRequestFilterDto): Promise<PublicRequestModel[]> {
        const whereConditions: Prisma.PublicRequestsWhereInput = {};

        if (params?.user_id) {
            whereConditions.user_id = params.user_id;
        }

        if (params?.search) {
            whereConditions.OR = [
                {
                    title: {
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

        return this.publicRequestPrismaRepository.findManyPublicRequests(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );
    }

    public async findOne(id: string): Promise<PublicRequestModel | null> {
        return this.publicRequestPrismaRepository.findUniquePublicRequest(id);
    }

    public async findMyRequests(params?: PublicRequestParamsDto): Promise<PublicRequestModel[]> {
        const user = this.authContextService.getUser();

        const whereConditions: Prisma.PublicRequestsWhereInput = {
            user_id: user.id,
        };

        return this.publicRequestPrismaRepository.findManyPublicRequests(
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
        updateDto: UpdatePublicRequestDto,
    ): Promise<PublicRequestModel> {
        const user = this.authContextService.getUser();

        const existingRequest =
            await this.publicRequestPrismaRepository.findPublicRequestByIdOnly(id);

        if (!existingRequest) {
            throw new HttpException("Public request not found", HttpStatus.NOT_FOUND);
        }

        if (existingRequest.user_id !== user.id) {
            throw new HttpException(
                "You can only update your own public requests",
                HttpStatus.FORBIDDEN,
            );
        }

        return this.publicRequestPrismaRepository.updatePublicRequest(id, updateDto);
    }

    public async remove(id: string): Promise<PublicRequestModel> {
        const user = this.authContextService.getUser();

        const existingRequest =
            await this.publicRequestPrismaRepository.findPublicRequestByIdOnly(id);

        if (!existingRequest) {
            throw new HttpException("Public request not found", HttpStatus.NOT_FOUND);
        }

        if (existingRequest.user_id !== user.id) {
            throw new HttpException(
                "You can only delete your own public requests",
                HttpStatus.FORBIDDEN,
            );
        }

        return this.publicRequestPrismaRepository.deletePublicRequest(id);
    }

    public async getProviderQuotesByPublicRequest(
        id: string,
        params?: PublicRequestParamsDto,
    ): Promise<ProviderQuoteModel[]> {
        const publicRequest = await this.publicRequestPrismaRepository.findUniquePublicRequest(id);

        if (!publicRequest) {
            throw new HttpException("Public request not found", HttpStatus.NOT_FOUND);
        }

        return this.providerQuoteService.findAll({
            public_request_id: id,
            limit: params?.limit,
            offset: params?.offset,
            order_by: params?.order_by,
        });
    }
}
