import type { Prisma } from "@prisma/client";

export type ProviderQuoteWithIncludes = Prisma.ProviderQuotesGetPayload<{
    include: {
        provider: true;
        public_request: true;
        provider_quote_items: {
            include: {
                item: true;
            };
        };
    };
}>;
