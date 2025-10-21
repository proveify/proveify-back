import { Injectable } from "@nestjs/common";
import { PublicRequests as PublicRequestModel, Prisma } from "@prisma/client";
import { PublicRequestEntity } from "../entities/public-request.entity";
import { UserService } from "@app/user/user.service";
import { UserEntity } from "@app/user/entities/user.entity";

type PublicRequestInput =
    | Prisma.PublicRequestsGetPayload<{ include: { user: true } }>
    | PublicRequestModel;

@Injectable()
export class PublicRequestFactory {
    public constructor(private readonly userService: UserService) {}

    public async create(publicRequest: PublicRequestInput): Promise<PublicRequestEntity> {
        const user =
            "user" in publicRequest
                ? new UserEntity(publicRequest.user)
                : await this.userService
                      .findUserOneById({ id: publicRequest.user_id })
                      .then((u) => (u ? new UserEntity(u) : undefined));

        return new PublicRequestEntity({
            ...publicRequest,
            user,
        });
    }

    public async createMany(publicRequests: PublicRequestInput[]): Promise<PublicRequestEntity[]> {
        return Promise.all(publicRequests.map(async (request) => this.create(request)));
    }
}
