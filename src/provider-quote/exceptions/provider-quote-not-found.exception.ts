import { NotFoundException } from "@nestjs/common";

export class ProviderQuoteNotFoundException extends NotFoundException {
    public constructor(quoteId: string) {
        super(`Provider quote with ID ${quoteId} not found`);
    }
}
