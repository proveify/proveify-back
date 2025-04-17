import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { UserEntity } from "@app/user/entities/user.entity";
import { UserService } from "@app/user/user.service";
import { HttpException, Injectable, Scope } from "@nestjs/common";
import { Users as UserModel } from "@prisma/client";

@Injectable({ scope: Scope.REQUEST })
export class AuthContextService {
    private user: UserEntity | undefined;

    public constructor(private userService: UserService) {}

    public async generateAuthContext(id: string): Promise<void> {
        const user = await this.userService.findUserOneById({
            where: { id },
            include: { Providers: true },
        });

        if (!user) {
            throw new HttpException("User not found", 404);
        }

        this.setUser(user);
    }

    public setUser(user: UserModel): void {
        this.user = new UserEntity(user);
    }

    public getUser(): UserEntity {
        if (this.user === undefined) {
            throw new Error("user has not been set");
        }

        return this.user;
    }

    public getProvider(): ProviderEntity | null {
        const user = this.getUser();
        const providers = user.Providers;

        if (!providers) {
            return null;
        }

        return providers[0];
    }

    public getUserId(): string {
        const user = this.getUser();
        return user.id;
    }
}
