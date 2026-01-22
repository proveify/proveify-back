import { Injectable } from "@nestjs/common";
import { UserService } from "@app/user/user.service";
import { UserEntity } from "@app/user/entities/user.entity";
import { ItemEntity } from "@app/item/entities/item.entity";
import { ItemService } from "@app/item/item.service";

@Injectable()
export class SearchService {
    public constructor(
        private readonly userService: UserService,
        private readonly itemService: ItemService,
    ) {}

    public async findProvider(query: string): Promise<UserEntity[]> {
        return this.userService.searchProviderUsers(query);
    }

    public async findProducts(query: string): Promise<ItemEntity[]> {
        return this.itemService.searchProducts(query);
    }

    public async findService(query: string): Promise<ItemEntity[]> {
        return this.itemService.searchServices(query);
    }
}
