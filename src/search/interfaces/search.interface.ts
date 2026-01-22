import type { ItemEntity } from "@app/item/entities/item.entity";
import type { UserEntity } from "@app/user/entities/user.entity";

export interface Search {
    providers: UserEntity[];
    services: ItemEntity[];
    products: ItemEntity[];
}
