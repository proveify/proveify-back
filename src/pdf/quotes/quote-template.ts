import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { QuoteEntity } from "@app/quote/entities/quote.entity";
import type { QuoteItemEntity } from "@app/quote/entities/quote-item.entity";
import type { UserEntity } from "@app/user/entities/user.entity";

export const quoteTemplate = (quote: QuoteEntity, provider: UserEntity): TDocumentDefinitions => {
    const ACCENT = "#fab005";
    const BLACK = "#000000";
    const WHITE = "#FFFFFF";

    const dateStr = new Date(quote.created_at).toLocaleDateString();

    const itemsRows = quote
        .generateItemsToPrint()
        .map((row) => [
            { text: row[0] ?? "" },
            { text: row[1] ?? "", alignment: "right" },
            { text: row[2] ?? "" },
            { text: row[3] ?? "", alignment: "right" },
            { text: row[4] ?? "", alignment: "right" },
        ]);

    const itemsBody = [
        [
            { text: "Nombre", style: "tableHeader" },
            { text: "Cantidad", style: "tableHeader", alignment: "right" },
            { text: "Descripción", style: "tableHeader" },
            { text: "Precio", style: "tableHeader", alignment: "right" },
            { text: "Total", style: "tableHeader", alignment: "right" },
        ],
        ...itemsRows,
    ];

    const subtotal = Array.isArray(quote.quote_items)
        ? quote.quote_items.reduce((sum: number, item: QuoteItemEntity) => {
              const qty = Number(item.quantity);
              return sum + item.price * qty;
          }, 0)
        : 0;

    const formatCurrency = (n: number): string => {
        try {
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(n);
        } catch {
            return n.toFixed(2);
        }
    };

    const total = subtotal;

    // Celda de imagen del proveedor (opcional para evitar errores si no hay imagen)
    const providerImageCell = provider.profile_picture_url
        ? {
              image: provider.profile_picture_url,
              fit: [64, 64],
              alignment: "right" as const,
              margin: [0, 0, 0, 0] as [number, number, number, number],
          }
        : {
              text: "",
              alignment: "right" as const,
          };

    return {
        info: {
            title: `Cotización - ${provider.name}`,
            author: provider.name,
            subject: "Cotización",
        },
        pageMargins: [40, 48, 40, 48],
        defaultStyle: {
            fontSize: 10,
            color: BLACK,
        },
        styles: {
            brandBandTitle: { color: WHITE, fontSize: 18, bold: true },
            brandBandSubtitle: { color: WHITE, fontSize: 10 },
            sectionTitle: { fontSize: 12, bold: true, color: BLACK, margin: [0, 16, 0, 8] },
            label: { bold: true },
            tableHeader: { bold: true, color: WHITE, fillColor: ACCENT },
            small: { fontSize: 9, color: "#444444" },
        },
        footer: (currentPage: number, pageCount: number) => ({
            columns: [
                { text: provider.name, style: "small" },
                {
                    text: `Página ${currentPage.toString()} de ${pageCount.toString()}`,
                    alignment: "right",
                    style: "small",
                },
            ],
            margin: [40, 0, 40, 24],
        }),
        content: [
            // Banda superior con datos del proveedor y logo opcional
            {
                table: {
                    widths: ["*", "auto"],
                    body: [
                        [
                            {
                                stack: [
                                    { text: provider.name, style: "brandBandTitle" },
                                    {
                                        text: `${provider.identification_type}: ${
                                            provider.identification
                                        }`,
                                        style: "brandBandSubtitle",
                                    },
                                    { text: provider.email, style: "brandBandSubtitle" },
                                ],
                                border: [false, false, false, false],
                                margin: [8, 8, 8, 8],
                            },
                            {
                                ...providerImageCell,
                                border: [false, false, false, false],
                                margin: [8, 8, 8, 8],
                            },
                        ],
                    ],
                },
                layout: "noBorders",
                fillColor: ACCENT,
                margin: [0, 0, 0, 16],
            },

            // Detalles del cliente y resumen
            {
                columns: [
                    {
                        width: "*",
                        table: {
                            widths: ["auto", "*"],
                            body: [
                                [{ text: "Cliente", style: "label" }, quote.name],
                                [{ text: "Email", style: "label" }, quote.email],
                                [
                                    { text: "Identificación", style: "label" },
                                    `${quote.identification_type} ${quote.identification}`,
                                ],
                                [{ text: "Fecha", style: "label" }, dateStr],
                                [{ text: "Estado", style: "label" }, quote.status],
                                [{ text: "ID Cotización", style: "label" }, quote.id],
                            ],
                        },
                        layout: "noBorders",
                    },
                    {
                        width: 200,
                        table: {
                            widths: ["*"],
                            body: [
                                [{ text: "Resumen", style: "sectionTitle", alignment: "center" }],
                                [
                                    {
                                        table: {
                                            widths: ["*", "auto"],
                                            body: [
                                                [
                                                    { text: "Subtotal" },
                                                    {
                                                        text: formatCurrency(subtotal),
                                                        alignment: "right",
                                                    },
                                                ],
                                                [
                                                    { text: "Total", bold: true },
                                                    {
                                                        text: formatCurrency(total),
                                                        alignment: "right",
                                                        bold: true,
                                                    },
                                                ],
                                            ],
                                        },
                                        layout: "lightHorizontalLines",
                                    },
                                ],
                            ],
                        },
                        layout: "noBorders",
                    },
                ],
                columnGap: 24,
                margin: [0, 0, 0, 16],
            },

            // Descripción de la cotización
            {
                text: quote.description,
                margin: [0, 0, 0, 12],
            },

            // Tabla de items
            {
                table: {
                    headerRows: 1,
                    widths: ["*", "auto", "*", "auto", "auto"],
                    body: itemsBody,
                },
                layout: {
                    fillColor: (rowIndex: number) =>
                        rowIndex === 0 ? ACCENT : rowIndex % 2 === 0 ? "#f9f9f9" : null,
                },
            },

            // Notas
            {
                text: "Notas",
                style: "sectionTitle",
            },
            {
                text: "Esta cotización es válida por 30 días. Los tiempos y alcances pueden variar según cambios solicitados.",
                style: "small",
            },
        ],
    };
};
