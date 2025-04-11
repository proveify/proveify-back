import { NotFoundException } from "@nestjs/common";

export class UserNotFoundException extends NotFoundException {
    public constructor(userId: string) {
        super(`User with ID ${userId} not found`);
    }
}
