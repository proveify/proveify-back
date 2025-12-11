import { Test, TestingModule } from "@nestjs/testing";
import { ProviderQuoteController } from "../../../src/provider-quote/provider-quote.controller";
import { ProviderQuoteService } from "../../../src/provider-quote/provider-quote.service";
import { ClassSerializerInterceptor, HttpException, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { TransactionInterceptor } from "../../../src/prisma/interceptors/transaction.interceptor";
import { Reflector } from "@nestjs/core";

const mockProviderQuoteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMyQuotes: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

describe("ProviderQuoteController", () => {
    let controller: ProviderQuoteController;
    let service: ProviderQuoteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProviderQuoteController],
            providers: [
                {
                    provide: ProviderQuoteService,
                    useValue: mockProviderQuoteService,
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideInterceptor(ClassSerializerInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .overrideInterceptor(TransactionInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .compile();

        controller = module.get<ProviderQuoteController>(ProviderQuoteController);
        service = module.get<ProviderQuoteService>(ProviderQuoteService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should create a provider quote successfully", async () => {
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
                    },
                ],
            };

            const createdQuote = {
                id: "quote-123",
                ...createDto,
                provider_id: "provider-123",
                status: "PENDING",
            };

            mockProviderQuoteService.create.mockResolvedValue(createdQuote);

            const result = await controller.create(createDto);

            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(createdQuote);
        });
    });

    describe("findAll", () => {
        it("should return all provider quotes", async () => {
            const mockQuotes = [
                { id: "quote-1", description: "Quote 1" },
                { id: "quote-2", description: "Quote 2" },
            ];

            mockProviderQuoteService.findAll.mockResolvedValue(mockQuotes);

            const result = await controller.findAll({});

            expect(service.findAll).toHaveBeenCalledWith({});
            expect(result).toEqual(mockQuotes);
        });

        it("should return provider quotes with filters", async () => {
            const params = {
                public_request_id: "request-123",
                status: "PENDING",
                limit: 10,
                offset: 0,
            };

            const mockQuotes = [{ id: "quote-1", description: "Quote 1" }];

            mockProviderQuoteService.findAll.mockResolvedValue(mockQuotes);

            const result = await controller.findAll(params);

            expect(service.findAll).toHaveBeenCalledWith(params);
            expect(result).toEqual(mockQuotes);
        });
    });

    describe("findMyQuotes", () => {
        it("should return quotes for the current provider", async () => {
            const mockQuotes = [
                { id: "quote-1", provider_id: "provider-123" },
                { id: "quote-2", provider_id: "provider-123" },
            ];

            mockProviderQuoteService.findMyQuotes.mockResolvedValue(mockQuotes);

            const result = await controller.findMyQuotes({});

            expect(service.findMyQuotes).toHaveBeenCalledWith({});
            expect(result).toEqual(mockQuotes);
        });

        it("should return my quotes with filters", async () => {
            const params = {
                status: "ACCEPTED",
                limit: 5,
            };

            const mockQuotes = [{ id: "quote-1", provider_id: "provider-123", status: "ACCEPTED" }];

            mockProviderQuoteService.findMyQuotes.mockResolvedValue(mockQuotes);

            const result = await controller.findMyQuotes(params);

            expect(service.findMyQuotes).toHaveBeenCalledWith(params);
            expect(result).toEqual(mockQuotes);
        });
    });

    describe("findOne", () => {
        it("should return a provider quote when it exists", async () => {
            const quoteId = "quote-123";
            const mockQuote = {
                id: quoteId,
                description: "Test Quote",
                total_price: 1000,
            };

            mockProviderQuoteService.findOne.mockResolvedValue(mockQuote);

            const result = await controller.findOne(quoteId);

            expect(service.findOne).toHaveBeenCalledWith(quoteId);
            expect(result).toEqual(mockQuote);
        });

        it("should throw HttpException when quote does not exist", async () => {
            const quoteId = "non-existent-quote";

            mockProviderQuoteService.findOne.mockResolvedValue(null);

            await expect(controller.findOne(quoteId)).rejects.toThrow(
                new HttpException("Provider quote not found", HttpStatus.NOT_FOUND),
            );
            expect(service.findOne).toHaveBeenCalledWith(quoteId);
        });
    });

    describe("update", () => {
        it("should update provider quote successfully", async () => {
            const quoteId = "quote-123";
            const updateDto = {
                total_price: "2000.00",
                description: "Updated description",
            };

            const updatedQuote = {
                id: quoteId,
                ...updateDto,
            };

            mockProviderQuoteService.update.mockResolvedValue(updatedQuote);

            const result = await controller.update(quoteId, updateDto);

            expect(service.update).toHaveBeenCalledWith(quoteId, updateDto);
            expect(result).toEqual(updatedQuote);
        });

        it("should update provider quote with items", async () => {
            const quoteId = "quote-123";
            const updateDto = {
                total_price: "3000.00",
                description: "Updated",
                provider_quote_items: [
                    {
                        name: "New Item",
                        description: "New desc",
                        quantity: 5,
                        unit_price: "600.00",
                    },
                ],
            };

            const updatedQuote = {
                id: quoteId,
                ...updateDto,
            };

            mockProviderQuoteService.update.mockResolvedValue(updatedQuote);

            const result = await controller.update(quoteId, updateDto);

            expect(service.update).toHaveBeenCalledWith(quoteId, updateDto);
            expect(result).toEqual(updatedQuote);
        });
    });

    describe("remove", () => {
        it("should delete provider quote successfully", async () => {
            const quoteId = "quote-123";
            const deletedQuote = {
                id: quoteId,
                description: "Deleted Quote",
            };

            mockProviderQuoteService.remove.mockResolvedValue(deletedQuote);

            const result = await controller.remove(quoteId);

            expect(service.remove).toHaveBeenCalledWith(quoteId);
            expect(result).toEqual(deletedQuote);
        });
    });
});
