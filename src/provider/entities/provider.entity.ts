import { Exclude } from "class-transformer";

export class ProviderEntity {
    @Exclude()
    public rut: string;

    @Exclude()
    public chamber_commerce: string;

    @Exclude()
    public created_at: Date;

    @Exclude()
    public updated_at: Date;

    @Exclude()
    public plan_id: string;

    @Exclude()
    public user_id: string;

    public constructor(partial: Partial<ProviderEntity>) {
        Object.assign(this, partial);
    }
}
