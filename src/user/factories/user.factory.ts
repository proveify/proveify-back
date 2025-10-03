import { Injectable } from "@nestjs/common";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { UserEntity } from "@app/user/entities/user.entity";
import { Prisma, Users as UserModel } from "@prisma/client";

type UserInput = Prisma.UsersGetPayload<{ include: { provider: true } }> | UserModel;

@Injectable()
export class UserFactory {
    public constructor(private readonly providerFactory: ProviderFactory) {}

    public async create(user: UserInput): Promise<UserEntity> {
        const data = {
            ...user,
            provider:
                "provider" in user && user.provider
                    ? await this.providerFactory.create(user.provider)
                    : null,
        };

        return new UserEntity(data);
    }

    public async createMany(users: UserInput[]): Promise<UserEntity[]> {
        return await Promise.all(users.map(async (user) => this.create(user)));
    }
}
