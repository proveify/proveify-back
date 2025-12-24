import type { Prisma, Quotes as QuoteModel } from "@prisma/client";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { Injectable } from "@nestjs/common";
import { QuoteItemEntity } from "@app/quote/entities/quote-item.entity";
import { ProviderFactory } from "@app/provider/factories/provider.factory";

type QuoteInput =
    | Prisma.QuotesGetPayload<{
          include: { quote_items: { include: { item: true } }; provider: true };
      }>
    | QuoteModel;

@Injectable()
export class QuoteFactory {
    public constructor(private readonly providerFactory: ProviderFactory) {}

    public async create(quote: QuoteInput): Promise<QuoteEntity> {
        const data = {
            ...quote,
            quote_items: [] as QuoteItemEntity[],
            provider:
                "provider" in quote ? await this.providerFactory.create(quote.provider) : null,
        };

        if ("quote_items" in quote) {
            const quoteItems = quote.quote_items.map((quoteItem) => {
                const quoteItemData = {
                    ...quoteItem,
                    item: undefined,
                };

                return new QuoteItemEntity(quoteItemData);
            });

            data.quote_items = quoteItems;
        }

        return new QuoteEntity(data);
    }

    public async createMany(quotes: QuoteInput[]): Promise<QuoteEntity[]> {
        return Promise.all(quotes.map((quote) => this.create(quote)));
    }
}
