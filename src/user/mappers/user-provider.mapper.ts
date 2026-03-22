import { Injectable } from "@nestjs/common";
import { UserFactory, UserInput } from "../factories/user.factory";
import { ProviderFactory, ProviderInput } from "@app/provider/factories/provider.factory";
import { UserEntity } from "../entities/user.entity";
import { ProviderEntity } from "@app/provider/entities/provider.entity";

@Injectable()
export class UserProviderMapper {
    public constructor(
        private readonly userFactory: UserFactory,
        private readonly providerFactory: ProviderFactory,
    ) {}

    public async toUserEntity(data: UserInput): Promise<UserEntity> {
        const entity = await this.userFactory.create(data);

        if ("provider" in data && data.provider) {
            entity.provider = await this.toProviderEntity(data.provider as ProviderInput);
        }

        return entity;
    }

    public async toUserEntities(data: UserInput[]): Promise<UserEntity[]> {
        return Promise.all(data.map((item) => this.toUserEntity(item)));
    }

    public async toProviderEntity(data: ProviderInput): Promise<ProviderEntity> {
        const entity = await this.providerFactory.create(data);

        if ("user" in data) {
            entity.user = await this.toUserEntity(data.user as UserInput);
        }

        return entity;
    }

    public async toProviderEntities(data: ProviderInput[]): Promise<ProviderEntity[]> {
        return Promise.all(data.map((item) => this.toProviderEntity(item)));
    }
}
