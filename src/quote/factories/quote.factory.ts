import type { Prisma, Quotes as QuoteModel } from "@prisma/client";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { Injectable } from "@nestjs/common";

type QuoteInput = Prisma.QuotesGetPayload<{ include: { quote_items: true } }> | QuoteModel;

@Injectable()
export class QuoteFactory {
    public create(quote: QuoteInput): QuoteEntity {
        return new QuoteEntity(quote);
    }

    public createMany(quotes: QuoteInput[]): QuoteEntity[] {
        return quotes.map((quote) => this.create(quote));
    }
}
