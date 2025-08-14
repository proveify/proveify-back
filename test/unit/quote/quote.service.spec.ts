import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { QuoteService } from "../../../src/quote/quote.service";
import { QuotePrismaRepository } from "../../../src/quote/repositories/quote-prisma.repository";
import { AuthContextService } from "../../../src/auth/auth-context.service";

const mockQuotePrismaRepository = {
    createQuote: jest.fn(),
    findManyQuotes: jest.fn(),
    findUniqueQuote: jest.fn(),
    findQuoteByIdOnly: jest.fn(),
    updateQuote: jest.fn(),
    deleteQuote: jest.fn(),
    findQuotesByProvider: jest.fn(),
    findProviderById: jest.fn(),
};

const mockAuthContextService = {
    getUser: jest.fn(),
    getProvider: jest.fn(),
};

describe("QuoteService", () => {
    let service: QuoteService;
    let quotePrismaRepository: QuotePrismaRepository;
    let authContextService: AuthContextService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuoteService,
                {
                    provide: QuotePrismaRepository,
                    useValue: mockQuotePrismaRepository,
                },
                {
                    provide: AuthContextService,
                    useValue: mockAuthContextService,
                },
            ],
        }).compile();

        service = module.get<QuoteService>(QuoteService);
        quotePrismaRepository = module.get<QuotePrismaRepository>(QuotePrismaRepository);
        authContextService = module.get<AuthContextService>(AuthContextService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a quote for authenticated user", async () => {
            const mockUser = { id: "user-1", name: "Test User" };
            const mockProvider = { id: "provider-1", name: "Test Provider" };
            const createDto = {
                provider_id: "provider-1",
                name: "John Doe",
                email: "john@example.com",
                identification: "12345678",
                identification_type: "CC",
                description: "Need development services",
                quote_items: [
                    {
                        name: "Website Development",
                        description: "Corporate website",
                        quantity: 1,
                    },
                ],
            };

            const createdQuote = {
                id: "quote-1",
                ...createDto,
                user_id: mockUser.id,
                status: "PENDING",
                created_at: new Date(),
                updated_at: new Date(),
                provider: mockProvider,
                quote_items: [
                    {
                        id: "item-1",
                        quote_id: "quote-1",
                        item_id: null,
                        name: "Website Development",
                        description: "Corporate website",
                        quantity: 1,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ],
            };

            mockQuotePrismaRepository.findProviderById.mockResolvedValue(mockProvider);
            mockAuthContextService.getUser.mockReturnValue(mockUser);
            mockQuotePrismaRepository.createQuote.mockResolvedValue(createdQuote);

            const result = await service.create(createDto);

            expect(result).toEqual(createdQuote);
            expect(quotePrismaRepository.findProviderById).toHaveBeenCalledWith("provider-1");
            expect(authContextService.getUser).toHaveBeenCalled();
            expect(quotePrismaRepository.createQuote).toHaveBeenCalledWith({
                name: createDto.name,
                email: createDto.email,
                identification: createDto.identification,
                identification_type: createDto.identification_type,
                description: createDto.description,
                user_id: mockUser.id,
                provider: { connect: { id: createDto.provider_id } },
                quote_items: {
                    create: [
                        {
                            name: "Website Development",
                            description: "Corporate website",
                            quantity: 1,
                        },
                    ],
                },
            });
        });

        it("should create a quote for anonymous user", async () => {
            const mockProvider = { id: "provider-1", name: "Test Provider" };
            const createDto = {
                provider_id: "provider-1",
                name: "Anonymous User",
                email: "anon@example.com",
                identification: "12345678",
                identification_type: "CC",
                description: "Need services",
                quote_items: [
                    {
                        name: "Service",
                        quantity: 1,
                    },
                ],
            };

            const createdQuote = {
                id: "quote-1",
                ...createDto,
                user_id: null,
                status: "PENDING",
                created_at: new Date(),
                updated_at: new Date(),
                provider: mockProvider,
                quote_items: [],
            };

            mockQuotePrismaRepository.findProviderById.mockResolvedValue(mockProvider);
            mockAuthContextService.getUser.mockImplementation(() => {
                throw new Error("user has not been set");
            });
            mockQuotePrismaRepository.createQuote.mockResolvedValue(createdQuote);

            const result = await service.create(createDto);

            expect(result).toEqual(createdQuote);
            expect(result.user_id).toBeNull();
        });

        it("should throw NOT_FOUND when provider does not exist", async () => {
            const createDto = {
                provider_id: "non-existent-provider",
                name: "John Doe",
                email: "john@example.com",
                identification: "12345678",
                identification_type: "CC",
                description: "Need services",
                quote_items: [
                    {
                        name: "Service",
                        quantity: 1,
                    },
                ],
            };

            mockQuotePrismaRepository.findProviderById.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(
                new HttpException("Provider not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should create quote with item reference when item_id provided", async () => {
            const mockProvider = { id: "provider-1", name: "Test Provider" };
            const createDto = {
                provider_id: "provider-1",
                name: "John Doe",
                email: "john@example.com",
                identification: "12345678",
                identification_type: "CC",
                description: "Need services",
                quote_items: [
                    {
                        item_id: "item-123",
                        name: "Existing Item",
                        quantity: 2,
                    },
                ],
            };

            mockQuotePrismaRepository.findProviderById.mockResolvedValue(mockProvider);
            mockAuthContextService.getUser.mockImplementation(() => {
                throw new Error("user has not been set");
            });
            mockQuotePrismaRepository.createQuote.mockResolvedValue({
                id: "quote-1",
                ...createDto,
                user_id: null,
            });

            await service.create(createDto);

            expect(quotePrismaRepository.createQuote).toHaveBeenCalledWith(
                expect.objectContaining({
                    quote_items: {
                        create: [
                            {
                                name: "Existing Item",
                                description: undefined,
                                quantity: 2,
                                item: { connect: { id: "item-123" } },
                            },
                        ],
                    },
                }),
            );
        });
    });

    describe("findAll", () => {
        it("should return all quotes without filters", async () => {
            const mockQuotes = [
                { id: "quote-1", status: "PENDING", created_at: new Date() },
                { id: "quote-2", status: "QUOTED", created_at: new Date() },
            ];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);

            const result = await service.findAll();

            expect(result).toEqual(mockQuotes);
            expect(quotePrismaRepository.findManyQuotes).toHaveBeenCalledWith({}, 30, undefined, {
                created_at: "desc",
            });
        });

        it("should return filtered quotes by provider_id", async () => {
            const providerId = "provider-1";
            const params = { provider_id: providerId };
            const mockQuotes = [{ id: "quote-1", provider_id: providerId }];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);

            const result = await service.findAll(params);

            expect(result).toEqual(mockQuotes);
            expect(quotePrismaRepository.findManyQuotes).toHaveBeenCalledWith(
                { provider_id: providerId },
                30,
                undefined,
                { created_at: "desc" },
            );
        });

        it("should return filtered quotes by status", async () => {
            const params = { status: "PENDING" };
            const mockQuotes = [{ id: "quote-1", status: "PENDING" }];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);

            const result = await service.findAll(params);

            expect(result).toEqual(mockQuotes);
            expect(quotePrismaRepository.findManyQuotes).toHaveBeenCalledWith(
                { status: "PENDING" },
                30,
                undefined,
                { created_at: "desc" },
            );
        });

        it("should return filtered quotes by search term", async () => {
            const params = { search: "development" };
            const mockQuotes = [
                { id: "quote-1", name: "Development Request", description: "Need development" },
            ];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);

            const result = await service.findAll(params);

            expect(result).toEqual(mockQuotes);
            expect(quotePrismaRepository.findManyQuotes).toHaveBeenCalledWith(
                {
                    OR: [
                        { name: { contains: "development" } },
                        { email: { contains: "development" } },
                        { description: { contains: "development" } },
                    ],
                },
                30,
                undefined,
                { created_at: "desc" },
            );
        });
    });

    describe("findOne", () => {
        it("should return a quote by id", async () => {
            const quoteId = "quote-1";
            const mockQuote = {
                id: quoteId,
                name: "Test Quote",
                email: "test@example.com",
                description: "Test description",
            };

            mockQuotePrismaRepository.findUniqueQuote.mockResolvedValue(mockQuote);

            const result = await service.findOne(quoteId);

            expect(result).toEqual(mockQuote);
            expect(quotePrismaRepository.findUniqueQuote).toHaveBeenCalledWith(quoteId);
        });

        it("should return null when quote not found", async () => {
            const quoteId = "non-existent";

            mockQuotePrismaRepository.findUniqueQuote.mockResolvedValue(null);

            const result = await service.findOne(quoteId);

            expect(result).toBeNull();
        });
    });

    describe("findMyQuotes", () => {
        it("should return provider's own quotes", async () => {
            const mockProvider = { id: "provider-1" };
            const mockQuotes = [{ id: "quote-1", provider_id: mockProvider.id }];

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuotesByProvider.mockResolvedValue(mockQuotes);

            const result = await service.findMyQuotes();

            expect(result).toEqual(mockQuotes);
            expect(quotePrismaRepository.findQuotesByProvider).toHaveBeenCalledWith(
                mockProvider.id,
                30,
                undefined,
                { created_at: "desc" },
            );
        });

        it("should throw FORBIDDEN when user has no provider profile", async () => {
            mockAuthContextService.getProvider.mockReturnValue(null);

            await expect(service.findMyQuotes()).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });
    });

    describe("update", () => {
        it("should update quote when user is owner", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const updateDto = {
                status: "QUOTED",
                quote_items: [
                    {
                        name: "Updated Service",
                        description: "Updated description",
                        quantity: 1,
                    },
                ],
            };
            const existingQuote = { id: quoteId, provider_id: mockProvider.id };
            const updatedQuote = { ...existingQuote, ...updateDto };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.updateQuote.mockResolvedValue(updatedQuote);

            const result = await service.update(quoteId, updateDto);

            expect(result).toEqual(updatedQuote);
            expect(quotePrismaRepository.updateQuote).toHaveBeenCalledWith(quoteId, {
                status: "QUOTED",
                quote_items: {
                    deleteMany: {},
                    create: [
                        {
                            name: "Updated Service",
                            description: "Updated description",
                            quantity: 1,
                        },
                    ],
                },
            });
        });

        it("should update only status when no quote_items provided", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const updateDto = { status: "QUOTED" };
            const existingQuote = { id: quoteId, provider_id: mockProvider.id };
            const updatedQuote = { ...existingQuote, status: "QUOTED" };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.updateQuote.mockResolvedValue(updatedQuote);

            const result = await service.update(quoteId, updateDto);

            expect(result).toEqual(updatedQuote);
            expect(quotePrismaRepository.updateQuote).toHaveBeenCalledWith(quoteId, {
                status: "QUOTED",
            });
        });

        it("should throw FORBIDDEN when user has no provider profile", async () => {
            mockAuthContextService.getProvider.mockReturnValue(null);

            await expect(service.update("quote-1", { status: "QUOTED" })).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw NOT_FOUND when quote does not exist", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "non-existent";
            const updateDto = { status: "QUOTED" };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(null);

            await expect(service.update(quoteId, updateDto)).rejects.toThrow(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw FORBIDDEN when user is not quote owner", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const updateDto = { status: "QUOTED" };
            const existingQuote = { id: quoteId, provider_id: "different-provider" };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);

            await expect(service.update(quoteId, updateDto)).rejects.toThrow(
                new HttpException("You can only update your own quotes", HttpStatus.FORBIDDEN),
            );
        });

        it("should handle quote_items with item_id reference", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const updateDto = {
                quote_items: [
                    {
                        item_id: "item-123",
                        name: "Referenced Item",
                        quantity: 2,
                    },
                ],
            };
            const existingQuote = { id: quoteId, provider_id: mockProvider.id };
            const updatedQuote = { ...existingQuote, ...updateDto };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.updateQuote.mockResolvedValue(updatedQuote);

            await service.update(quoteId, updateDto);

            expect(quotePrismaRepository.updateQuote).toHaveBeenCalledWith(quoteId, {
                quote_items: {
                    deleteMany: {},
                    create: [
                        {
                            name: "Referenced Item",
                            description: undefined,
                            quantity: 2,
                            item: { connect: { id: "item-123" } },
                        },
                    ],
                },
            });
        });
    });

    describe("updateStatus", () => {
        it("should update quote status when user is owner", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const status = "QUOTED";
            const existingQuote = { id: quoteId, provider_id: mockProvider.id };
            const updatedQuote = { ...existingQuote, status };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.updateQuote.mockResolvedValue(updatedQuote);

            const result = await service.updateStatus(quoteId, status);

            expect(result).toEqual(updatedQuote);
            expect(quotePrismaRepository.updateQuote).toHaveBeenCalledWith(quoteId, { status });
        });

        it("should throw FORBIDDEN when user has no provider profile", async () => {
            mockAuthContextService.getProvider.mockReturnValue(null);

            await expect(service.updateStatus("quote-1", "QUOTED")).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw NOT_FOUND when quote does not exist", async () => {
            const mockProvider = { id: "provider-1" };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(null);

            await expect(service.updateStatus("non-existent", "QUOTED")).rejects.toThrow(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw FORBIDDEN when user is not quote owner", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const existingQuote = { id: quoteId, provider_id: "different-provider" };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);

            await expect(service.updateStatus(quoteId, "QUOTED")).rejects.toThrow(
                new HttpException("You can only update your own quotes", HttpStatus.FORBIDDEN),
            );
        });
    });

    describe("remove", () => {
        it("should delete quote when user is owner", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const existingQuote = { id: quoteId, provider_id: mockProvider.id };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.deleteQuote.mockResolvedValue(existingQuote);

            const result = await service.remove(quoteId);

            expect(result).toEqual(existingQuote);
            expect(quotePrismaRepository.deleteQuote).toHaveBeenCalledWith(quoteId);
        });

        it("should throw FORBIDDEN when user has no provider profile", async () => {
            mockAuthContextService.getProvider.mockReturnValue(null);

            await expect(service.remove("quote-1")).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw NOT_FOUND when quote does not exist", async () => {
            const mockProvider = { id: "provider-1" };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(null);

            await expect(service.remove("non-existent")).rejects.toThrow(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw FORBIDDEN when user is not quote owner", async () => {
            const mockProvider = { id: "provider-1" };
            const quoteId = "quote-1";
            const existingQuote = { id: quoteId, provider_id: "different-provider" };

            mockAuthContextService.getProvider.mockReturnValue(mockProvider);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);

            await expect(service.remove(quoteId)).rejects.toThrow(
                new HttpException("You can only delete your own quotes", HttpStatus.FORBIDDEN),
            );
        });
    });
});
