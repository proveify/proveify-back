import type { Prisma } from "@prisma/client";

export class ItemEntity {
    public id: string;
    public name: string;
    public description: string | null;
    public price: Prisma.Decimal;
    public image: string | null;
    public created_at: Date;
    public updated_at: Date;
    public provider_id: string;

    public constructor(partial: Partial<ItemEntity>) {
        Object.assign(this, partial);
    }
}
