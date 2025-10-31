import { Injectable } from "@nestjs/common";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { UserEntity } from "@app/user/entities/user.entity";
import { Prisma, Users as UserModel } from "@prisma/client";

type UserInput = Prisma.UsersGetPayload<{ include: { provider?: true } }> | UserModel;

@Injectable()
export class UserFactory {
    public constructor(private readonly providerFactory: ProviderFactory) {}

    public async create(user: UserInput): Promise<UserEntity> {
        const providerData = "provider" in user && user.provider ? user.provider : null;

        const data = {
            ...user,
            provider: providerData ? await this.providerFactory.create(providerData) : null,
        };

        return new UserEntity(data);
    }
}
