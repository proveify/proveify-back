import { Test, TestingModule } from "@nestjs/testing";
import { ProviderQuoteService } from "../../../src/provider-quote/provider-quote.service";
import { ProviderQuotePrismaRepository } from "../../../src/provider-quote/repositories/provider-quote-prisma.repository";
import { ProviderQuoteFactory } from "../../../src/provider-quote/factories/provider-quote.factory";
import { ClsService } from "nestjs-cls";
import { HttpException, HttpStatus } from "@nestjs/common";

const mockProviderQuotePrismaRepository = {
    createProviderQuote: jest.fn(),
    findManyProviderQuotes: jest.fn(),
    findUniqueProviderQuote: jest.fn(),
    findProviderQuoteByIdOnly: jest.fn(),
    findPublicRequestById: jest.fn(),
    findByPublicRequestAndProvider: jest.fn(),
    updateProviderQuote: jest.fn(),
    deleteProviderQuote: jest.fn(),
};

const mockProviderQuoteFactory = {
    create: jest.fn(),
    createMany: jest.fn(),
};

const mockClsService = {
    get: jest.fn(),
    set: jest.fn(),
};

describe("ProviderQuoteService", () => {
    let service: ProviderQuoteService;
    let repository: ProviderQuotePrismaRepository;
    let factory: ProviderQuoteFactory;
    let clsService: ClsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProviderQuoteService,
                {
                    provide: ProviderQuotePrismaRepository,
                    useValue: mockProviderQuotePrismaRepository,
                },
                {
                    provide: ProviderQuoteFactory,
                    useValue: mockProviderQuoteFactory,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
                },
            ],
        }).compile();

        service = module.get<ProviderQuoteService>(ProviderQuoteService);
        repository = module.get<ProviderQuotePrismaRepository>(ProviderQuotePrismaRepository);
        factory = module.get<ProviderQuoteFactory>(ProviderQuoteFactory);
        clsService = module.get<ClsService>(ClsService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a provider quote successfully", async () => {
            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123",
                    name: "Test Provider",
                },
            };

            const createDto = {
                public_request_id: "request-123",
                total_price: "1000.00",
                description: "Test quote",
                provider_quote_items: [
                    {
                        name: "Item 1",
                        description: "Description 1",
                        quantity: 2,
                        unit_price: "500.00",
                        item_id: "item-123",
                    },
                ],
            };

            const createdQuote = {
                id: "quote-123",
                ...createDto,
                provider_id: "provider-123",
                status: "PENDING",
            };

            const quoteEntity = { ...createdQuote, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findPublicRequestById.mockResolvedValue({
                id: "request-123",
            });
            mockProviderQuotePrismaRepository.findByPublicRequestAndProvider.mockResolvedValue(
                null,
            );
            mockProviderQuotePrismaRepository.createProviderQuote.mockResolvedValue(createdQuote);
            mockProviderQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.create(createDto);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(repository.findPublicRequestById).toHaveBeenCalledWith("request-123");
            expect(repository.findByPublicRequestAndProvider).toHaveBeenCalledWith(
                "request-123",
                "provider-123",
            );
            expect(repository.createProviderQuote).toHaveBeenCalled();
            expect(factory.create).toHaveBeenCalledWith(createdQuote);
            expect(result).toEqual(quoteEntity);
        });

        it("should throw exception when user has no provider profile", async () => {
            const mockUser = {
                id: "user-123",
                provider: null,
            };

            const createDto = {
                public_request_id: "request-123",
                total_price: "1000.00",
                description: "Test quote",
                provider_quote_items: [],
            };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.create(createDto)).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw exception when public request does not exist", async () => {
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const createDto = {
                public_request_id: "non-existent-request",
                total_price: "1000.00",
                description: "Test quote",
                provider_quote_items: [],
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findPublicRequestById.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(
                new HttpException("Public request not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw exception when quote already exists", async () => {
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const createDto = {
                public_request_id: "request-123",
                total_price: "1000.00",
                description: "Test quote",
                provider_quote_items: [],
            };

            const existingQuote = { id: "existing-quote-123" };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findPublicRequestById.mockResolvedValue({
                id: "request-123",
            });
            mockProviderQuotePrismaRepository.findByPublicRequestAndProvider.mockResolvedValue(
                existingQuote,
            );

            await expect(service.create(createDto)).rejects.toThrow(
                new HttpException(
                    "You have already submitted a quote for this request",
                    HttpStatus.CONFLICT,
                ),
            );
        });
    });

    describe("findAll", () => {
        it("should return all provider quotes with default params", async () => {
            const mockQuotes = [
                { id: "quote-1", description: "Quote 1" },
                { id: "quote-2", description: "Quote 2" },
            ];

            const quoteEntities = mockQuotes.map((q) => ({ ...q, formatted: true }));

            mockProviderQuotePrismaRepository.findManyProviderQuotes.mockResolvedValue(mockQuotes);
            mockProviderQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findAll();

            expect(repository.findManyProviderQuotes).toHaveBeenCalledWith({}, 30, undefined, {
                created_at: "desc",
            });
            expect(factory.createMany).toHaveBeenCalledWith(mockQuotes);
            expect(result).toEqual(quoteEntities);
        });

        it("should filter by public_request_id and status", async () => {
            const params = {
                public_request_id: "request-123",
                status: "PENDING",
                limit: 10,
                offset: 5,
                order_by: "asc" as const,
            };

            const mockQuotes = [{ id: "quote-1", description: "Quote 1" }];
            const quoteEntities = mockQuotes.map((q) => ({ ...q, formatted: true }));

            mockProviderQuotePrismaRepository.findManyProviderQuotes.mockResolvedValue(mockQuotes);
            mockProviderQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findAll(params);

            expect(repository.findManyProviderQuotes).toHaveBeenCalledWith(
                { public_request_id: "request-123", status: "PENDING" },
                10,
                5,
                { created_at: "asc" },
            );
            expect(result).toEqual(quoteEntities);
        });
    });

    describe("findOne", () => {
        it("should return a provider quote when it exists", async () => {
            const quoteId = "quote-123";
            const mockQuote = { id: quoteId, description: "Test Quote" };
            const quoteEntity = { ...mockQuote, formatted: true };

            mockProviderQuotePrismaRepository.findUniqueProviderQuote.mockResolvedValue(mockQuote);
            mockProviderQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.findOne(quoteId);

            expect(repository.findUniqueProviderQuote).toHaveBeenCalledWith(quoteId);
            expect(factory.create).toHaveBeenCalledWith(mockQuote);
            expect(result).toEqual(quoteEntity);
        });

        it("should return null when quote does not exist", async () => {
            const quoteId = "non-existent-quote";

            mockProviderQuotePrismaRepository.findUniqueProviderQuote.mockResolvedValue(null);

            const result = await service.findOne(quoteId);

            expect(repository.findUniqueProviderQuote).toHaveBeenCalledWith(quoteId);
            expect(factory.create).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe("findMyQuotes", () => {
        it("should return quotes for the current provider", async () => {
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const mockQuotes = [
                { id: "quote-1", provider_id: "provider-123" },
                { id: "quote-2", provider_id: "provider-123" },
            ];

            const quoteEntities = mockQuotes.map((q) => ({ ...q, formatted: true }));

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findManyProviderQuotes.mockResolvedValue(mockQuotes);
            mockProviderQuoteFactory.createMany.mockReturnValue(quoteEntities);

            const result = await service.findMyQuotes();

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(repository.findManyProviderQuotes).toHaveBeenCalledWith(
                { provider_id: "provider-123" },
                30,
                undefined,
                { created_at: "desc" },
            );
            expect(result).toEqual(quoteEntities);
        });

        it("should throw exception when user has no provider profile", async () => {
            const mockUser = {
                id: "user-123",
                provider: null,
            };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.findMyQuotes()).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });
    });

    describe("update", () => {
        it("should update provider quote successfully", async () => {
            const quoteId = "quote-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const updateDto = {
                total_price: "2000.00",
                description: "Updated description",
                provider_quote_items: [
                    {
                        name: "Updated Item",
                        description: "Updated desc",
                        quantity: 3,
                        unit_price: "666.67",
                    },
                ],
            };

            const existingQuote = {
                id: quoteId,
                provider_id: "provider-123",
                status: "PENDING",
            };

            const updatedQuote = {
                id: quoteId,
                ...updateDto,
            };

            const quoteEntity = { ...updatedQuote, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findProviderQuoteByIdOnly.mockResolvedValue(
                existingQuote,
            );
            mockProviderQuotePrismaRepository.updateProviderQuote.mockResolvedValue(updatedQuote);
            mockProviderQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.update(quoteId, updateDto);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(repository.findProviderQuoteByIdOnly).toHaveBeenCalledWith(quoteId);
            expect(repository.updateProviderQuote).toHaveBeenCalled();
            expect(factory.create).toHaveBeenCalledWith(updatedQuote);
            expect(result).toEqual(quoteEntity);
        });

        it("should throw exception when quote does not exist", async () => {
            const quoteId = "non-existent-quote";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const updateDto = {
                total_price: "2000.00",
                description: "Updated",
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findProviderQuoteByIdOnly.mockResolvedValue(null);

            await expect(service.update(quoteId, updateDto)).rejects.toThrow(
                new HttpException("Provider quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw exception when updating another provider's quote", async () => {
            const quoteId = "quote-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const updateDto = {
                total_price: "2000.00",
                description: "Updated",
            };

            const existingQuote = {
                id: quoteId,
                provider_id: "different-provider-456",
                status: "PENDING",
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findProviderQuoteByIdOnly.mockResolvedValue(
                existingQuote,
            );

            await expect(service.update(quoteId, updateDto)).rejects.toThrow(
                new HttpException("You can only update your own quotes", HttpStatus.FORBIDDEN),
            );
        });

        it("should throw exception when quote is not pending", async () => {
            const quoteId = "quote-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const updateDto = {
                total_price: "2000.00",
                description: "Updated",
            };

            const existingQuote = {
                id: quoteId,
                provider_id: "provider-123",
                status: "ACCEPTED",
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findProviderQuoteByIdOnly.mockResolvedValue(
                existingQuote,
            );

            await expect(service.update(quoteId, updateDto)).rejects.toThrow(
                new HttpException(
                    "Cannot update a quote that has been accepted or rejected",
                    HttpStatus.BAD_REQUEST,
                ),
            );
        });
    });

    describe("remove", () => {
        it("should delete provider quote successfully", async () => {
            const quoteId = "quote-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const existingQuote = {
                id: quoteId,
                provider_id: "provider-123",
            };

            const deletedQuote = { ...existingQuote, deleted: true };
            const quoteEntity = { ...deletedQuote, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findProviderQuoteByIdOnly.mockResolvedValue(
                existingQuote,
            );
            mockProviderQuotePrismaRepository.deleteProviderQuote.mockResolvedValue(deletedQuote);
            mockProviderQuoteFactory.create.mockReturnValue(quoteEntity);

            const result = await service.remove(quoteId);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(repository.findProviderQuoteByIdOnly).toHaveBeenCalledWith(quoteId);
            expect(repository.deleteProviderQuote).toHaveBeenCalledWith(quoteId);
            expect(factory.create).toHaveBeenCalledWith(deletedQuote);
            expect(result).toEqual(quoteEntity);
        });

        it("should throw exception when quote does not exist", async () => {
            const quoteId = "non-existent-quote";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findProviderQuoteByIdOnly.mockResolvedValue(null);

            await expect(service.remove(quoteId)).rejects.toThrow(
                new HttpException("Provider quote not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw exception when deleting another provider's quote", async () => {
            const quoteId = "quote-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const existingQuote = {
                id: quoteId,
                provider_id: "different-provider-456",
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderQuotePrismaRepository.findProviderQuoteByIdOnly.mockResolvedValue(
                existingQuote,
            );

            await expect(service.remove(quoteId)).rejects.toThrow(
                new HttpException("You can only delete your own quotes", HttpStatus.FORBIDDEN),
            );
        });
    });
});
