import { NotFoundException } from "@nestjs/common";

export class PublicRequestNotFoundException extends NotFoundException {
    public constructor(requestId: string) {
        super(`Public request with ID ${requestId} not found`);
    }
}
