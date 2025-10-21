import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PublicRequestPrismaRepository } from "./repositories/public-request-prisma.repository";
import {
    CreatePublicRequestDto,
    UpdatePublicRequestDto,
    PublicRequestParamsDto,
    PublicRequestFilterDto,
} from "./dto/public-request.dto";
import type { ProviderQuotes as ProviderQuoteModel, Prisma } from "@prisma/client";
import { ProviderQuoteService } from "@app/provider-quote/provider-quote.service";
import { PublicRequestEntity } from "./entities/public-request.entity";
import { PublicRequestFactory } from "./factories/public-request.factory";
import type { PublicRequests as PublicRequestModel, Prisma } from "@prisma/client";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";

@Injectable()
export class PublicRequestService {
    public constructor(
        private publicRequestPrismaRepository: PublicRequestPrismaRepository,
        private cls: ClsService,
    ) {}

    public async create(createDto: CreatePublicRequestDto): Promise<PublicRequestModel> {
        const user = this.cls.get<UserEntity>("user");

        const publicRequestData: Prisma.PublicRequestsCreateInput = {
            title: createDto.title,
            description: createDto.description,
            user: {
                connect: {
                    id: user.id,
                },
            },
        };

        const result =
            await this.publicRequestPrismaRepository.createPublicRequest(publicRequestData);
        return this.publicRequestFactory.create(result);
    }

    public async findAll(params?: PublicRequestFilterDto): Promise<PublicRequestEntity[]> {
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

        const results = await this.publicRequestPrismaRepository.findManyPublicRequests(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );

        return this.publicRequestFactory.createMany(results);
    }

    public async findOne(id: string): Promise<PublicRequestEntity | null> {
        const result = await this.publicRequestPrismaRepository.findUniquePublicRequest(id);

        if (!result) {
            return null;
        }

        return this.publicRequestFactory.create(result);
    }

    public async findMyRequests(params?: PublicRequestParamsDto): Promise<PublicRequestModel[]> {
        const user = this.cls.get<UserEntity>("user");

        const whereConditions: Prisma.PublicRequestsWhereInput = {
            user_id: user.id,
        };

        const results = await this.publicRequestPrismaRepository.findManyPublicRequests(
            whereConditions,
            params?.limit ?? 30,
            params?.offset,
            {
                created_at: params?.order_by ?? "desc",
            },
        );

        return this.publicRequestFactory.createMany(results);
    }

    public async update(
        id: string,
        updateDto: UpdatePublicRequestDto,
    ): Promise<PublicRequestModel> {
        const user = this.cls.get<UserEntity>("user");

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

        const result = await this.publicRequestPrismaRepository.updatePublicRequest(id, updateDto);
        return this.publicRequestFactory.create(result);
    }

    public async remove(id: string): Promise<PublicRequestModel> {
        const user = this.cls.get<UserEntity>("user");

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

        const result = await this.publicRequestPrismaRepository.deletePublicRequest(id);
        return this.publicRequestFactory.create(result);
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
