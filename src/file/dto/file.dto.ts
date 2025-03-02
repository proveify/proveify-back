import type { Prisma } from "@prisma/client";

export class CreateFileDto {
    public user: Prisma.UsersCreateNestedOneWithoutFilesInput;
    public original_name: string;
    public path: string;
    public resource_type: string;
    public name: string;
}
