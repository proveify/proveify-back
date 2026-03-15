import { Exclude, Expose } from "class-transformer";

@Exclude()
export class QuoteMessageEntity {
    @Expose()
    public id: string;

    @Expose()
    public message: string;

    @Expose()
    public created_at: Date;

    @Expose()
    public user_id: string;

    public constructor(partial: Partial<QuoteMessageEntity>) {
        Object.assign(this, partial);
    }
}
