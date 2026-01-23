import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ProviderItemEntity {
    @Expose()
    public id: string;

    @Expose()
    public name?: string;

    @Expose()
    public profile_picture_url?: string | null;

    public constructor(partial: Partial<ProviderItemEntity>) {
        Object.assign(this, partial);
    }
}
