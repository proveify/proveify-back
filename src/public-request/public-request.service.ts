import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import { AuthContextService } from "@app/auth/auth-context.service";
import {
    CreatePublicRequestDto,
    UpdatePublicRequestDto,
    PublicRequestParamsDto,
    PublicRequestFilterDto,
} from "./dto/public-request.dto";
import type { PublicRequests as PublicRequestModel } from "@prisma/client";

@Injectable()
export class PublicRequestService {
    public constructor(
        private prisma: PrismaService,
        private authContextService: AuthContextService,
    ) {}

    public async create(createDto: CreatePublicRequestDto): Promise<PublicRequestModel> {
        throw new Error("Method not implemented");
    }

    public async findAll(params?: PublicRequestFilterDto): Promise<PublicRequestModel[]> {
        throw new Error("Method not implemented");
    }

    public async findOne(id: string): Promise<PublicRequestModel | null> {
        throw new Error("Method not implemented");
    }

    public async findMyRequests(params?: PublicRequestParamsDto): Promise<PublicRequestModel[]> {
        throw new Error("Method not implemented");
    }

    public async update(id: string, updateDto: UpdatePublicRequestDto): Promise<PublicRequestModel> {
        throw new Error("Method not implemented");
    }

    public async remove(id: string): Promise<PublicRequestModel> {
        throw new Error("Method not implemented");
    }
}
