import { Expose } from "class-transformer";

export class ProviderEntity {
    @Expose()
    public id: string;

    @Expose()
    public name: string;

    @Expose()
    public email: string;

    @Expose()
    public identification: string;

    @Expose()
    public identification_type: string;

    public constructor(partial: Partial<ProviderEntity>) {
        Object.assign(this, partial);
    }
}
