import { Injectable, Scope } from "@nestjs/common";
import { Users as UserModel } from "@prisma/client";

@Injectable({ scope: Scope.REQUEST })
export class UserStoreService {
    public user: UserModel | null = null;

    public setUser(user: UserModel): void {
        this.user = user;
    }

    public getUsers(): UserModel | null {
        return this.user;
    }
}
