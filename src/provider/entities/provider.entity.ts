import { OmitType } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class ProviderEntity {
    public id: string;

    public name: string;

    public email: string;

    public identification: string;

    public identification_type: string;

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

export class ProviderEntityDocumentation extends OmitType(ProviderEntity, [
    "rut",
    "chamber_commerce",
    "created_at",
    "updated_at",
    "plan_id",
    "user_id",
] as const) {}
