import type { Prisma, Quotes as QuoteModel } from "@prisma/client";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { Injectable } from "@nestjs/common";
import { QuoteItemEntity } from "@app/quote/entities/quote-item.entity";
import { ProviderFactory } from "@app/provider/factories/provider.factory";

type QuoteInput =
    | Prisma.QuotesGetPayload<{ include: { quote_items: true; provider: true } }>
    | QuoteModel;

@Injectable()
export class QuoteFactory {
    public constructor(private readonly providerFactory: ProviderFactory) {}

    public async create(quote: QuoteInput): Promise<QuoteEntity> {
        const data = {
            ...quote,
            quote_items:
                "quote_items" in quote
                    ? quote.quote_items.map((item) => new QuoteItemEntity(item))
                    : [],
            provider:
                "provider" in quote ? await this.providerFactory.create(quote.provider) : null,
        };

        return new QuoteEntity(data);
    }

    public async createMany(quotes: QuoteInput[]): Promise<QuoteEntity[]> {
        return Promise.all(quotes.map((quote) => this.create(quote)));
    }
}
