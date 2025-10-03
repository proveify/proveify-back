import { Injectable } from "@nestjs/common";
import { ProviderQuoteEntity, ProviderQuoteItemEntity } from "../entities/provider-quote.entity";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { ItemFactory } from "@app/item/factories/item.factory";
import { ProviderQuoteWithIncludes } from "../types/provider-quote.types";

@Injectable()
export class ProviderQuoteFactory {
    public constructor(
        private readonly providerFactory: ProviderFactory,
        private readonly itemFactory: ItemFactory,
    ) {}

    public async create(quote: ProviderQuoteWithIncludes): Promise<ProviderQuoteEntity> {
        const provider = await this.providerFactory.create(quote.provider);

        const providerQuoteItems = await Promise.all(
            quote.provider_quote_items.map(async (quoteItem) => {
                const item = quoteItem.item
                    ? await this.itemFactory.create(quoteItem.item)
                    : undefined;

                return new ProviderQuoteItemEntity({
                    ...quoteItem,
                    item,
                });
            }),
        );

        return new ProviderQuoteEntity({
            ...quote,
            provider,
            provider_quote_items: providerQuoteItems,
        });
    }

    public async createMany(quotes: ProviderQuoteWithIncludes[]): Promise<ProviderQuoteEntity[]> {
        return Promise.all(quotes.map((quote) => this.create(quote)));
    }
}
