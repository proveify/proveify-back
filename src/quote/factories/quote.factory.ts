import type { Prisma, Quotes as QuoteModel } from "@prisma/client";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { Injectable } from "@nestjs/common";
import { QuoteItemEntity } from "@app/quote/entities/quote-item.entity";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { FileService } from "@app/file/file.service";

type QuoteInput =
    | Prisma.QuotesGetPayload<{
          include: {
              quote_items: { include: { item: { include: { itemImages: true } } } };
              provider: true;
          };
      }>
    | QuoteModel;

@Injectable()
export class QuoteFactory {
    public constructor(
        private readonly providerFactory: ProviderFactory,
        private readonly fileService: FileService,
    ) {}

    public async create(quote: QuoteInput): Promise<QuoteEntity> {
        const data = {
            ...quote,
            quote_items: [] as QuoteItemEntity[],
            provider:
                "provider" in quote ? await this.providerFactory.create(quote.provider) : null,
        };

        if ("quote_items" in quote) {
            data.quote_items = await Promise.all(
                quote.quote_items.map(async (quoteItem) => {
                    const quoteItemData: QuoteItemEntity = {
                        ...quoteItem,
                        price: quoteItem.price.toNumber(),
                    };

                    if ("item" in quoteItem && quoteItem.item && "itemImages" in quoteItem.item) {
                        const itemImagesUrls = await Promise.all(
                            quoteItem.item.itemImages.map(async (image) => {
                                return await this.fileService.getFileUrlById(image.id);
                            }),
                        );

                        quoteItemData.item_images = itemImagesUrls.filter((url) => url !== null);
                    }

                    return new QuoteItemEntity(quoteItemData);
                }),
            );
        }

        return new QuoteEntity(data);
    }

    public async createMany(quotes: QuoteInput[]): Promise<QuoteEntity[]> {
        return Promise.all(quotes.map((quote) => this.create(quote)));
    }
}
