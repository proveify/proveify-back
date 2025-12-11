import { Test, TestingModule } from "@nestjs/testing";
import { QuotePrismaRepository } from "../../../src/quote/repositories/quote-prisma.repository";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { TransactionContextService } from "../../../src/prisma/transaction-context.service";

const mockPrismaService = {
    quotes: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    providers: {
        findUnique: jest.fn(),
    },
};

const mockTransactionContextService = {
    getTransaction: jest.fn().mockReturnValue(null),
};

describe("QuotePrismaRepository", () => {
    let repository: QuotePrismaRepository;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuotePrismaRepository,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: TransactionContextService,
                    useValue: mockTransactionContextService,
                },
            ],
        }).compile();

        repository = module.get<QuotePrismaRepository>(QuotePrismaRepository);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(repository).toBeDefined();
    });

    describe("createQuote", () => {
        it("should create a quote with relations", async () => {
            const quoteData = {
                name: "John Doe",
                email: "john@example.com",
                identification: "12345678",
                identification_type: "CC",
                description: "Need development services",
                provider: { connect: { id: "provider-1" } },
                quote_items: {
                    create: [
                        {
                            name: "Website Development",
                            description: "Corporate website",
                            quantity: 1,
                        },
                    ],
                },
            };

            const createdQuote = {
                id: "quote-1",
                ...quoteData,
                status: "PENDING",
                user_id: null,
                created_at: new Date(),
                updated_at: new Date(),
                provider: { id: "provider-1", name: "Test Provider" },
                quote_items: [
                    {
                        id: "item-1",
                        quote_id: "quote-1",
                        name: "Website Development",
                        description: "Corporate website",
                        quantity: 1,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ],
            };

            mockPrismaService.quotes.create.mockResolvedValue(createdQuote);

            const result = await repository.createQuote(quoteData);

            expect(result).toEqual(createdQuote);
            expect(prismaService.quotes.create).toHaveBeenCalledWith({
                data: quoteData,
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
        });
    });

    describe("findManyQuotes", () => {
        it("should find quotes with default parameters", async () => {
            const mockQuotes = [
                {
                    id: "quote-1",
                    name: "John Doe",
                    email: "john@example.com",
                    status: "PENDING",
                    created_at: new Date(),
                    provider: { id: "provider-1", name: "Test Provider" },
                    quote_items: [],
                },
            ];

            mockPrismaService.quotes.findMany.mockResolvedValue(mockQuotes);

            const result = await repository.findManyQuotes();

            expect(result).toEqual(mockQuotes);
            expect(prismaService.quotes.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
                take: undefined,
                skip: undefined,
                orderBy: undefined,
            });
        });

        it("should find quotes with filters and pagination", async () => {
            const whereClause = { status: "PENDING" };
            const take = 10;
            const skip = 0;
            const orderBy = { created_at: "desc" as const };
            const mockQuotes = [
                {
                    id: "quote-1",
                    status: "PENDING",
                    provider: { id: "provider-1" },
                    quote_items: [],
                },
            ];

            mockPrismaService.quotes.findMany.mockResolvedValue(mockQuotes);

            const result = await repository.findManyQuotes(whereClause, take, skip, orderBy);

            expect(result).toEqual(mockQuotes);
            expect(prismaService.quotes.findMany).toHaveBeenCalledWith({
                where: whereClause,
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
                take,
                skip,
                orderBy,
            });
        });
    });

    describe("findUniqueQuote", () => {
        it("should find a quote by id with relations", async () => {
            const quoteId = "quote-1";
            const mockQuote = {
                id: quoteId,
                name: "John Doe",
                email: "john@example.com",
                status: "PENDING",
                provider: { id: "provider-1", name: "Test Provider" },
                quote_items: [
                    {
                        id: "item-1",
                        name: "Service",
                        quantity: 1,
                        item: null,
                    },
                ],
            };

            mockPrismaService.quotes.findUnique.mockResolvedValue(mockQuote);

            const result = await repository.findUniqueQuote(quoteId);

            expect(result).toEqual(mockQuote);
            expect(prismaService.quotes.findUnique).toHaveBeenCalledWith({
                where: { id: quoteId },
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
        });

        it("should return null when quote not found", async () => {
            const quoteId = "non-existent";

            mockPrismaService.quotes.findUnique.mockResolvedValue(null);

            const result = await repository.findUniqueQuote(quoteId);

            expect(result).toBeNull();
        });
    });

    describe("findQuoteByIdOnly", () => {
        it("should find a quote by id without relations", async () => {
            const quoteId = "quote-1";
            const mockQuote = {
                id: quoteId,
                name: "John Doe",
                email: "john@example.com",
                status: "PENDING",
                provider_id: "provider-1",
            };

            mockPrismaService.quotes.findUnique.mockResolvedValue(mockQuote);

            const result = await repository.findQuoteByIdOnly(quoteId);

            expect(result).toEqual(mockQuote);
            expect(prismaService.quotes.findUnique).toHaveBeenCalledWith({
                where: { id: quoteId },
            });
        });
    });

    describe("updateQuote", () => {
        it("should update a quote with relations", async () => {
            const quoteId = "quote-1";
            const updateData = { status: "QUOTED" };
            const updatedQuote = {
                id: quoteId,
                status: "QUOTED",
                name: "John Doe",
                provider: { id: "provider-1", name: "Test Provider" },
                quote_items: [],
            };

            mockPrismaService.quotes.update.mockResolvedValue(updatedQuote);

            const result = await repository.updateQuote(quoteId, updateData);

            expect(result).toEqual(updatedQuote);
            expect(prismaService.quotes.update).toHaveBeenCalledWith({
                where: { id: quoteId },
                data: updateData,
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
        });
    });

    describe("deleteQuote", () => {
        it("should delete a quote and return it with relations", async () => {
            const quoteId = "quote-1";
            const deletedQuote = {
                id: quoteId,
                name: "John Doe",
                status: "PENDING",
                provider: { id: "provider-1", name: "Test Provider" },
                quote_items: [],
            };

            mockPrismaService.quotes.delete.mockResolvedValue(deletedQuote);

            const result = await repository.deleteQuote(quoteId);

            expect(result).toEqual(deletedQuote);
            expect(prismaService.quotes.delete).toHaveBeenCalledWith({
                where: { id: quoteId },
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
        });
    });

    describe("findQuotesByProvider", () => {
        it("should find quotes by provider id", async () => {
            const providerId = "provider-1";
            const take = 10;
            const skip = 0;
            const orderBy = { created_at: "desc" as const };
            const mockQuotes = [
                {
                    id: "quote-1",
                    provider_id: providerId,
                    name: "Customer Request",
                    provider: { id: providerId, name: "Test Provider" },
                    quote_items: [],
                },
            ];

            mockPrismaService.quotes.findMany.mockResolvedValue(mockQuotes);

            const result = await repository.findQuotesByProvider(providerId, take, skip, orderBy);

            expect(result).toEqual(mockQuotes);
            expect(prismaService.quotes.findMany).toHaveBeenCalledWith({
                where: { provider_id: providerId },
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
                take,
                skip,
                orderBy,
            });
        });

        it("should find quotes by provider without pagination", async () => {
            const providerId = "provider-1";
            const mockQuotes = [
                {
                    id: "quote-1",
                    provider_id: providerId,
                    provider: { id: providerId },
                    quote_items: [],
                },
            ];

            mockPrismaService.quotes.findMany.mockResolvedValue(mockQuotes);

            const result = await repository.findQuotesByProvider(providerId);

            expect(result).toEqual(mockQuotes);
            expect(prismaService.quotes.findMany).toHaveBeenCalledWith({
                where: { provider_id: providerId },
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
                take: undefined,
                skip: undefined,
                orderBy: undefined,
            });
        });
    });

    describe("countQuotesByProvider", () => {
        it("should count quotes by provider id", async () => {
            const providerId = "provider-1";
            const expectedCount = 5;

            mockPrismaService.quotes.count.mockResolvedValue(expectedCount);

            const result = await repository.countQuotesByProvider(providerId);

            expect(result).toBe(expectedCount);
            expect(prismaService.quotes.count).toHaveBeenCalledWith({
                where: { provider_id: providerId },
            });
        });
    });

    describe("findQuotesByStatus", () => {
        it("should find quotes by status", async () => {
            const status = "PENDING";
            const take = 10;
            const skip = 0;
            const mockQuotes = [
                {
                    id: "quote-1",
                    status,
                    name: "Pending Quote",
                    provider: { id: "provider-1" },
                    quote_items: [],
                },
            ];

            mockPrismaService.quotes.findMany.mockResolvedValue(mockQuotes);

            const result = await repository.findQuotesByStatus(status, take, skip);

            expect(result).toEqual(mockQuotes);
            expect(prismaService.quotes.findMany).toHaveBeenCalledWith({
                where: { status },
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
                take,
                skip,
                orderBy: { created_at: "desc" },
            });
        });

        it("should find quotes by status without pagination", async () => {
            const status = "QUOTED";
            const mockQuotes = [
                {
                    id: "quote-1",
                    status,
                    provider: { id: "provider-1" },
                    quote_items: [],
                },
            ];

            mockPrismaService.quotes.findMany.mockResolvedValue(mockQuotes);

            const result = await repository.findQuotesByStatus(status);

            expect(result).toEqual(mockQuotes);
            expect(prismaService.quotes.findMany).toHaveBeenCalledWith({
                where: { status },
                include: {
                    provider: true,
                    quote_items: {
                        include: {
                            item: true,
                        },
                    },
                },
                take: undefined,
                skip: undefined,
                orderBy: { created_at: "desc" },
            });
        });
    });

    describe("findProviderById", () => {
        it("should find a provider by id", async () => {
            const providerId = "provider-1";
            const mockProvider = {
                id: providerId,
                name: "Test Provider",
                email: "provider@example.com",
                created_at: new Date(),
            };

            mockPrismaService.providers.findUnique.mockResolvedValue(mockProvider);

            const result = await repository.findProviderById(providerId);

            expect(result).toEqual(mockProvider);
            expect(prismaService.providers.findUnique).toHaveBeenCalledWith({
                where: { id: providerId },
            });
        });

        it("should return null when provider not found", async () => {
            const providerId = "non-existent";

            mockPrismaService.providers.findUnique.mockResolvedValue(null);

            const result = await repository.findProviderById(providerId);

            expect(result).toBeNull();
        });
    });
});
