import { Injectable } from "@nestjs/common";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { UserEntity } from "@app/user/entities/user.entity";
import { Prisma, Users as UserModel } from "@prisma/client";
import { FileService } from "@app/file/file.service";

type UserInput = Prisma.UsersGetPayload<{ include: { provider?: true } }> | UserModel;

@Injectable()
export class UserFactory {
    public constructor(
        private readonly providerFactory: ProviderFactory,
        private readonly fileService: FileService,
    ) {}

    public async create(user: UserInput): Promise<UserEntity> {
        const providerData = "provider" in user && user.provider ? user.provider : null;

        const data = {
            ...user,
            provider: providerData ? await this.providerFactory.create(providerData) : null,
            profile_picture_url: user.profile_picture_id
                ? await this.fileService.getFileUrlById(user.profile_picture_id)
                : null,
        };

        return new UserEntity(data);
    }
}
