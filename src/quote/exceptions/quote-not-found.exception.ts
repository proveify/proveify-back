import { NotFoundException } from "@nestjs/common";

export class QuoteNotFoundException extends NotFoundException {
    public constructor(quoteId: string) {
        super(`Quote with ID ${quoteId} not found`);
    }
}
