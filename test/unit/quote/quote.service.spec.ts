import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { QuoteService } from "@app/quote/quote.service";
import { QuotePrismaRepository } from "@app/quote/repositories/quote-prisma.repository";
import { ClsService } from "nestjs-cls";
import { QuoteFactory } from "@app/quote/factories/quote.factory";
import { PdfService } from "@app/pdf/pdf.service";

const mockQuotePrismaRepository = {
    createQuote: jest.fn(),
    findManyQuotes: jest.fn(),
    findUniqueQuote: jest.fn(),
    findQuoteByIdOnly: jest.fn(),
    updateQuote: jest.fn(),
    deleteQuote: jest.fn(),
    findQuotesByProvider: jest.fn(),
    findProviderById: jest.fn(),
    providerBelongsToQuote: jest.fn(),
    userBelongsToQuote: jest.fn(),
    getQuoteMessages: jest.fn(),
};

const mockClsService = {
    get: jest.fn(),
};

const mockQuoteFactory = {
    create: jest.fn(),
    createMany: jest.fn(),
};

const mockPdfService = {
    generateQuotePdf: jest.fn(),
};

describe("QuoteService", () => {
    let service: QuoteService;
    let quotePrismaRepository: QuotePrismaRepository;
    let clsService: ClsService;
    let quoteFactory: QuoteFactory;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuoteService,
                {
                    provide: QuotePrismaRepository,
                    useValue: mockQuotePrismaRepository,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
                },
                {
                    provide: QuoteFactory,
                    useValue: mockQuoteFactory,
                },
                {
                    provide: PdfService,
                    useValue: mockPdfService,
                },
            ],
        }).compile();

        service = module.get<QuoteService>(QuoteService);
        quotePrismaRepository = module.get<QuotePrismaRepository>(QuotePrismaRepository);
        clsService = module.get<ClsService>(ClsService);
        quoteFactory = module.get<QuoteFactory>(QuoteFactory);

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
                provider_id: createDto.provider_id,
                name: createDto.name,
                email: createDto.email,
                identification: createDto.identification,
                identification_type: createDto.identification_type,
                description: createDto.description,
                user_id: mockUser.id,
                status: "PENDING",
                created_at: new Date(),
                updated_at: new Date(),
            };

            const quoteEntity = { ...createdQuote };

            mockQuotePrismaRepository.findProviderById.mockResolvedValue(mockProvider);
            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.createQuote.mockResolvedValue(createdQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.create(createDto as any);

            expect(result).toEqual(quoteEntity);
            expect(quotePrismaRepository.findProviderById).toHaveBeenCalledWith("provider-1");
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(quoteFactory.create).toHaveBeenCalledWith(createdQuote);
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
                provider_id: createDto.provider_id,
                name: createDto.name,
                email: createDto.email,
                identification: createDto.identification,
                identification_type: createDto.identification_type,
                description: createDto.description,
                user_id: null,
                status: "PENDING",
                created_at: new Date(),
                updated_at: new Date(),
            };

            const quoteEntity = { ...createdQuote };

            mockQuotePrismaRepository.findProviderById.mockResolvedValue(mockProvider);
            mockClsService.get.mockReturnValue(undefined);
            mockQuotePrismaRepository.createQuote.mockResolvedValue(createdQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.create(createDto as any);

            expect(result).toEqual(quoteEntity);
            expect(createdQuote.user_id).toBeNull();
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

            await expect(service.create(createDto as any)).rejects.toThrow(
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

            const createdQuote = {
                id: "quote-1",
                provider_id: createDto.provider_id,
                user_id: null,
                name: createDto.name,
                email: createDto.email,
                identification: createDto.identification,
                identification_type: createDto.identification_type,
                description: createDto.description,
                status: "PENDING",
                created_at: new Date(),
                updated_at: new Date(),
            };

            const quoteEntity = { ...createdQuote };

            mockQuotePrismaRepository.findProviderById.mockResolvedValue(mockProvider);
            mockClsService.get.mockReturnValue(undefined);
            mockQuotePrismaRepository.createQuote.mockResolvedValue(createdQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            await service.create(createDto as any);

            expect(quotePrismaRepository.createQuote).toHaveBeenCalledWith(
                expect.objectContaining({
                    quote_items: {
                        create: [
                            expect.objectContaining({
                                name: "Existing Item",
                                quantity: 2,
                                item: { connect: { id: "item-123" } },
                            }),
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

            const quoteEntities = [...mockQuotes];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);
            mockQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findAll();

            expect(result).toEqual(quoteEntities);
            expect(quotePrismaRepository.findManyQuotes).toHaveBeenCalledWith({}, 30, undefined, {
                created_at: "desc",
            });
        });

        it("should return filtered quotes by provider_id", async () => {
            const providerId = "provider-1";
            const params = { provider_id: providerId };
            const mockQuotes = [{ id: "quote-1", provider_id: providerId }];
            const quoteEntities = [...mockQuotes];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);
            mockQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findAll(params);

            expect(result).toEqual(quoteEntities);
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
            const quoteEntities = [...mockQuotes];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);
            mockQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findAll(params as any);

            expect(result).toEqual(quoteEntities);
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
            const quoteEntities = [...mockQuotes];

            mockQuotePrismaRepository.findManyQuotes.mockResolvedValue(mockQuotes);
            mockQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findAll(params);

            expect(result).toEqual(quoteEntities);
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
            const quoteEntity = { ...mockQuote };

            mockQuotePrismaRepository.findUniqueQuote.mockResolvedValue(mockQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.findOne(quoteId);

            expect(result).toEqual(quoteEntity);
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
        it("should return quotes for the current provider", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
            const mockQuotes = [{ id: "quote-1", provider_id: mockProvider.id }];
            const quoteEntities = [...mockQuotes];

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuotesByProvider.mockResolvedValue(mockQuotes);
            mockQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findMyQuotesLikeProvider();

            expect(result).toEqual(quoteEntities);
            expect(quotePrismaRepository.findQuotesByProvider).toHaveBeenCalledWith(
                mockProvider.id,
                30,
                undefined,
                { created_at: "desc" },
            );
        });

        it("should throw FORBIDDEN when user has no provider profile", async () => {
            const mockUser = { id: "user-1", provider: null };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.findMyQuotesLikeProvider()).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });
    });

    describe("update", () => {
        it("should update quote when user is owner", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
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
            const updatedQuote = { ...existingQuote, status: "QUOTED" };
            const quoteEntity = { ...updatedQuote };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.updateQuote.mockResolvedValue(updatedQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.update(quoteId, updateDto as any);

            expect(result).toEqual(quoteEntity);
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
            const mockUser = { id: "user-1", provider: mockProvider };
            const quoteId = "quote-1";
            const updateDto = { status: "QUOTED" };
            const existingQuote = { id: quoteId, provider_id: mockProvider.id };
            const updatedQuote = { ...existingQuote, status: "QUOTED" };
            const quoteEntity = { ...updatedQuote };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.updateQuote.mockResolvedValue(updatedQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.update(quoteId, updateDto as any);

            expect(result).toEqual(quoteEntity);
            expect(quotePrismaRepository.updateQuote).toHaveBeenCalledWith(quoteId, {
                status: "QUOTED",
            });
        });

        it("should throw FORBIDDEN when user has no provider profile", async () => {
            const mockUser = { id: "user-1", provider: null };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.update("quote-1", { status: "QUOTED" } as any)).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw NOT_FOUND when quote does not exist", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
            const quoteId = "non-existent";
            const updateDto = { status: "QUOTED" };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(null);

            await expect(service.update(quoteId, updateDto as any)).rejects.toThrow(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw FORBIDDEN when user is not quote owner", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
            const quoteId = "quote-1";
            const updateDto = { status: "QUOTED" };
            const existingQuote = { id: quoteId, provider_id: "different-provider" };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);

            await expect(service.update(quoteId, updateDto as any)).rejects.toThrow(
                new HttpException("You can only update your own quotes", HttpStatus.FORBIDDEN),
            );
        });

        it("should handle quote_items with item_id reference", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
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
            const updatedQuote = { ...existingQuote };
            const quoteEntity = { ...updatedQuote };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.updateQuote.mockResolvedValue(updatedQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            await service.update(quoteId, updateDto as any);

            expect(quotePrismaRepository.updateQuote).toHaveBeenCalledWith(quoteId, {
                quote_items: {
                    deleteMany: {},
                    create: [
                        expect.objectContaining({
                            name: "Referenced Item",
                            quantity: 2,
                            item: { connect: { id: "item-123" } },
                        }),
                    ],
                },
            });
        });
    });

    describe("remove", () => {
        it("should delete quote when user is owner", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
            const quoteId = "quote-1";
            const existingQuote = { id: quoteId, provider_id: mockProvider.id };
            const deletedQuote = { ...existingQuote };
            const quoteEntity = { ...deletedQuote };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);
            mockQuotePrismaRepository.deleteQuote.mockResolvedValue(deletedQuote);
            mockQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.remove(quoteId);

            expect(result).toEqual(quoteEntity);
            expect(quotePrismaRepository.deleteQuote).toHaveBeenCalledWith(quoteId);
        });

        it("should throw FORBIDDEN when user has no provider profile", async () => {
            const mockUser = { id: "user-1", provider: null };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.remove("quote-1")).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw NOT_FOUND when quote does not exist", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(null);

            await expect(service.remove("non-existent")).rejects.toThrow(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw FORBIDDEN when user is not quote owner", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
            const quoteId = "quote-1";
            const existingQuote = { id: quoteId, provider_id: "different-provider" };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.findQuoteByIdOnly.mockResolvedValue(existingQuote);

            await expect(service.remove(quoteId)).rejects.toThrow(
                new HttpException("You can only delete your own quotes", HttpStatus.FORBIDDEN),
            );
        });
    });

    describe("getQuoteMessages", () => {
        it("should return quote messages for provider", async () => {
            const quoteId = "quote-1";
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
            const params = {
                getAs: "PROVIDER" as any,
                limit: 10,
                offset: 0,
                order_by: "asc" as const,
            };
            const mockMessages = [
                {
                    id: "msg-1",
                    quote_id: quoteId,
                    message: "Test message 1",
                    created_at: new Date(),
                },
                {
                    id: "msg-2",
                    quote_id: quoteId,
                    message: "Test message 2",
                    created_at: new Date(),
                },
            ];

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.providerBelongsToQuote.mockResolvedValue(true);
            mockQuotePrismaRepository.getQuoteMessages.mockResolvedValue(mockMessages);

            const result = await service.getQuoteMessages(quoteId, params);

            expect(result).toHaveLength(2);
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(quotePrismaRepository.providerBelongsToQuote).toHaveBeenCalledWith(
                "provider-1",
                quoteId,
            );
            expect(quotePrismaRepository.getQuoteMessages).toHaveBeenCalledWith({
                where: { quote_id: quoteId },
                take: 10,
                skip: 0,
                orderBy: { created_at: "asc" },
            });
        });

        it("should throw FORBIDDEN when provider has no provider profile", async () => {
            const mockUser = { id: "user-1", provider: null };
            const params = { getAs: "PROVIDER" as any };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.getQuoteMessages("quote-1", params)).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw FORBIDDEN when provider does not belong to quote", async () => {
            const mockProvider = { id: "provider-1" };
            const mockUser = { id: "user-1", provider: mockProvider };
            const params = { getAs: "PROVIDER" as any };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.providerBelongsToQuote.mockResolvedValue(false);

            await expect(service.getQuoteMessages("quote-1", params)).rejects.toThrow(
                new HttpException("Provider does not belong to quote", HttpStatus.FORBIDDEN),
            );
        });

        it("should return quote messages for client", async () => {
            const quoteId = "quote-1";
            const mockUser = { id: "user-1", provider: null };
            const params = { getAs: "CLIENT" as any, limit: 30 };
            const mockMessages = [
                { id: "msg-1", quote_id: quoteId, message: "Test message", created_at: new Date() },
            ];

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.userBelongsToQuote.mockResolvedValue(true);
            mockQuotePrismaRepository.getQuoteMessages.mockResolvedValue(mockMessages);

            const result = await service.getQuoteMessages(quoteId, params);

            expect(result).toHaveLength(1);
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(quotePrismaRepository.userBelongsToQuote).toHaveBeenCalledWith(
                "user-1",
                quoteId,
            );
            expect(quotePrismaRepository.getQuoteMessages).toHaveBeenCalledWith({
                where: { quote_id: quoteId },
                take: 30,
                skip: undefined,
                orderBy: { created_at: "desc" },
            });
        });

        it("should throw FORBIDDEN when user does not belong to quote", async () => {
            const mockUser = { id: "user-1", provider: null };
            const params = { getAs: "CLIENT" as any };

            mockClsService.get.mockReturnValue(mockUser);
            mockQuotePrismaRepository.userBelongsToQuote.mockResolvedValue(false);

            await expect(service.getQuoteMessages("quote-1", params)).rejects.toThrow(
                new HttpException("User does not belong to quote", HttpStatus.FORBIDDEN),
            );
        });
    });

    describe("generatePrint", () => {
        it("should generate PDF for a quote successfully", async () => {
            const quoteId = "quote-1";
            const mockQuote = {
                id: quoteId,
                name: "Test Quote",
                email: "test@example.com",
                provider: {
                    id: "provider-1",
                    name: "Test Provider",
                    email: "provider@example.com",
                },
                quote_items: [],
            };
            const mockBuffer = Buffer.from("PDF content");

            mockQuotePrismaRepository.findUniqueQuote.mockResolvedValue(mockQuote);
            mockQuoteFactory.create.mockReturnValue(mockQuote);
            mockPdfService.generateQuotePdf.mockResolvedValue(mockBuffer);

            const result = await service.generatePrint(quoteId);

            expect(result).toEqual(mockBuffer);
            expect(quotePrismaRepository.findUniqueQuote).toHaveBeenCalledWith(quoteId);
            expect(mockPdfService.generateQuotePdf).toHaveBeenCalledWith(
                mockQuote,
                mockQuote.provider,
            );
        });

        it("should throw NOT_FOUND when quote does not exist", async () => {
            mockQuotePrismaRepository.findUniqueQuote.mockResolvedValue(null);

            await expect(service.generatePrint("non-existent")).rejects.toThrow(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw NOT_FOUND when quote has no provider", async () => {
            const mockQuote = {
                id: "quote-1",
                name: "Test Quote",
                provider: null,
            };

            mockQuotePrismaRepository.findUniqueQuote.mockResolvedValue(mockQuote);
            mockQuoteFactory.create.mockReturnValue(mockQuote);

            await expect(service.generatePrint("quote-1")).rejects.toThrow(
                new HttpException("Provider not found", HttpStatus.NOT_FOUND),
            );
        });
    });
});
