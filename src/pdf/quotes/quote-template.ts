import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { QuoteEntity } from "@app/quote/entities/quote.entity";
import type { ProviderEntity } from "@app/provider/entities/provider.entity";

export const quoteTemplate = (
    quote: QuoteEntity,
    provider: ProviderEntity,
): TDocumentDefinitions => ({
    content: [
        {
            columns: [
                {
                    stack: [
                        {
                            text: provider.name,
                        },
                        {
                            text: `${provider.identification_type}: ${provider.identification}`,
                        },
                    ],
                },
            ],
        },
        {
            columns: [
                {
                    stack: [
                        {
                            text: `Cliente: ${quote.name}`,
                        },
                        {
                            text: `Email: ${quote.email}`,
                        },
                        {
                            text: `${quote.identification_type}: ${quote.identification}`,
                        },
                        {
                            text: `Fecha: ${quote.created_at.toLocaleDateString()}`,
                        },
                    ],
                },
                {
                    text: quote.description,
                },
            ],
        },
        {
            table: {
                widths: ["auto", "auto", 100, "auto", "auto"],
                body: [
                    ["Nombre", "Cantidad", "Descripción", "Precio", "Total"],
                    ...quote.generateItemsToPrint(),
                ],
            },
        },
    ],
});
