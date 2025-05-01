import type { ProviderEntity } from "@app/provider/entities/provider.entity";
import type { UserEntity } from "@app/user/entities/user.entity";
import { Prisma } from "@prisma/client";
import { Exclude } from "class-transformer";

export class QuoteGroupEntity {
    public id: string;
    public User: UserEntity | null;
    public name: string;
    public identification_type: string;
    public identificaiton: string;
    public craeted_at: Date;
    public updated_at: Date;
    public Quotes: QuoteEntity[];

    public constructor(partial: Partial<QuoteGroupEntity>) {
        Object.assign(this, partial);
    }
}

export class QuoteEntity {
    public id: string;
    public status: string;
    public created_at: Date;
    public send_at: Date | null;
    public total: Prisma.Decimal;
    public description: string | null;

    @Exclude()
    public updated_at: Date | null;

    public Provider: ProviderEntity;
    public Items: QuoteItemsEntity[];

    public constructor(partial: Partial<QuoteEntity>) {
        Object.assign(this, partial);
    }
}

export class QuoteItemsEntity {
    public id: string;
    public quote_id: string;
    public item_id: string;
    public name: string;
    public price: Prisma.Decimal;
    public quantity: number;
    public desciption: string | null;

    @Exclude()
    public updated_at: Date;

    @Exclude()
    public created_at: Date;

    public constructor(partial: Partial<QuoteEntity>) {
        Object.assign(this, partial);
    }
}
