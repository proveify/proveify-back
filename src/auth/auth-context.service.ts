import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { UserEntity } from "@app/user/entities/user.entity";
import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class AuthContextService {
    public user?: UserEntity;

    public setUser(user: UserEntity): void {
        this.user = user;
    }

    public getUser(): UserEntity {
        if (this.user === undefined) {
            throw new Error("user has not been set");
        }

        return this.user;
    }

    public getProvider(): ProviderEntity | null {
        const user = this.getUser();
        return user.provider;
    }

    public hasUser(): boolean {
        return this.user !== undefined;
    }
}
