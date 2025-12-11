import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus, ClassSerializerInterceptor } from "@nestjs/common";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { Reflector } from "@nestjs/core";
import { QuoteController } from "@app/quote/quote.controller";
import { QuoteService } from "@app/quote/quote.service";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { plainToInstance } from "class-transformer";
import { OptionalJwtAuthGuard } from "@app/auth/guards/optional-jwt.guard";
import { TransactionInterceptor } from "@app/prisma/interceptors/transaction.interceptor";
import { OwnerSerializerInterceptor } from "@app/common/interceptors/owner-serializer.interceptor";
import { ClsService } from "nestjs-cls";

const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

const mockOptionalJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
};

const mockClsService = {
    get: jest.fn(),
    set: jest.fn(),
};

const mockQuoteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findMyQuotesLikeProvider: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getQuoteMessages: jest.fn(),
    generatePrint: jest.fn(),
};

describe("QuoteController", () => {
    let controller: QuoteController;
    let quoteService: QuoteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuoteController],
            providers: [
                {
                    provide: QuoteService,
                    useValue: mockQuoteService,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
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
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(mockOptionalJwtAuthGuard)
            .overrideInterceptor(ClassSerializerInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .overrideInterceptor(TransactionInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .overrideInterceptor(OwnerSerializerInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .compile();

        controller = module.get<QuoteController>(QuoteController);
        quoteService = module.get<QuoteService>(QuoteService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should create a quote successfully", async () => {
            const createDto = {
                provider_id: "provider-1",
                name: "John Doe",
                email: "john@example.com",
                identification: "12345678",
                identification_type: "CC",
                description: "Need web development services",
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
                status: "PENDING",
                user_id: null,
                created_at: new Date(),
                updated_at: new Date(),
                provider: {
                    id: "provider-1",
                    name: "Test Provider",
                },
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

            mockQuoteService.create.mockResolvedValue(createdQuote);

            const result = await controller.create(createDto as any);
            const serialized = plainToInstance(QuoteEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("quote-1");
            expect(serialized.provider_id).toBe(createDto.provider_id);
            expect(serialized.name).toBe(createDto.name);
            expect(quoteService.create).toHaveBeenCalledWith(createDto);
        });

        it("should throw exception when provider not found", async () => {
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

            mockQuoteService.create.mockRejectedValue(
                new HttpException("Provider not found", HttpStatus.NOT_FOUND),
            );

            await expect(controller.create(createDto as any)).rejects.toThrow(
                new HttpException("Provider not found", HttpStatus.NOT_FOUND),
            );
        });
    });

    describe("findAll", () => {
        it("should return an array of quotes", async () => {
            const mockQuotes = [
                {
                    id: "quote-1",
                    provider_id: "provider-1",
                    name: "John Doe",
                    email: "john@example.com",
                    identification: "12345678",
                    identification_type: "CC",
                    description: "Need development",
                    status: "PENDING",
                    user_id: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                    provider: { id: "provider-1", name: "Test Provider" },
                    quote_items: [],
                },
                {
                    id: "quote-2",
                    provider_id: "provider-2",
                    name: "Jane Smith",
                    email: "jane@example.com",
                    identification: "87654321",
                    identification_type: "CC",
                    description: "Need design",
                    status: "QUOTED",
                    user_id: "user-1",
                    created_at: new Date(),
                    updated_at: new Date(),
                    provider: { id: "provider-2", name: "Design Provider" },
                    quote_items: [],
                },
            ];

            mockQuoteService.findAll.mockResolvedValue(mockQuotes);

            const result = await controller.findAll({});

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("quote-1");
            expect(result[1].id).toBe("quote-2");
            expect(quoteService.findAll).toHaveBeenCalledWith({});
        });

        it("should return filtered quotes by provider", async () => {
            const params = { provider_id: "provider-1" };
            const mockQuotes = [
                {
                    id: "quote-1",
                    provider_id: "provider-1",
                    name: "John Doe",
                    email: "john@example.com",
                    status: "PENDING",
                    created_at: new Date(),
                    updated_at: new Date(),
                    provider: { id: "provider-1", name: "Test Provider" },
                    quote_items: [],
                },
            ];

            mockQuoteService.findAll.mockResolvedValue(mockQuotes);

            const result = await controller.findAll(params);

            expect(result).toHaveLength(1);
            expect(result[0].provider_id).toBe("provider-1");
            expect(quoteService.findAll).toHaveBeenCalledWith(params);
        });
    });

    describe("findOne", () => {
        it("should return a quote when it exists", async () => {
            const mockQuote = {
                id: "test-quote-id",
                provider_id: "provider-1",
                name: "John Doe",
                email: "john@example.com",
                identification: "12345678",
                identification_type: "CC",
                description: "Test description",
                status: "PENDING",
                user_id: null,
                created_at: new Date(),
                updated_at: new Date(),
                provider: { id: "provider-1", name: "Test Provider" },
                quote_items: [],
            };

            mockQuoteService.findOne.mockResolvedValue(mockQuote);

            const result = await controller.findOne("test-quote-id");
            const serialized = plainToInstance(QuoteEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-quote-id");
            expect(quoteService.findOne).toHaveBeenCalledWith("test-quote-id");
        });

        it("should throw exception when quote does not exist", async () => {
            mockQuoteService.findOne.mockResolvedValue(null);

            await expect(controller.findOne("non-existent-id")).rejects.toThrow(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );
        });
    });

    describe("findMyQuotesLikeProvider", () => {
        it("should return provider's own quotes", async () => {
            const mockQuotes = [
                {
                    id: "quote-1",
                    provider_id: "provider-1",
                    name: "Customer Request",
                    email: "customer@example.com",
                    status: "PENDING",
                    created_at: new Date(),
                    updated_at: new Date(),
                    provider: { id: "provider-1", name: "My Provider" },
                    quote_items: [],
                },
            ];

            mockQuoteService.findMyQuotesLikeProvider.mockResolvedValue(mockQuotes);

            const result = await controller.findMyQuotesLikeProvider({});

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("quote-1");
            expect(quoteService.findMyQuotesLikeProvider).toHaveBeenCalledWith({});
        });

        it("should throw exception when user has no provider profile", async () => {
            mockQuoteService.findMyQuotesLikeProvider.mockRejectedValue(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );

            await expect(controller.findMyQuotesLikeProvider({})).rejects.toThrow(
                new HttpException("User does not have a provider profile", HttpStatus.FORBIDDEN),
            );
        });
    });

    describe("update", () => {
        it("should update and return a quote when user is owner", async () => {
            const updateDto = {
                status: "QUOTED",
                quote_items: [
                    {
                        name: "Updated Service",
                        description: "Updated description",
                        quantity: 2,
                    },
                ],
            };

            const updatedQuote = {
                id: "test-quote-id",
                provider_id: "provider-1",
                name: "John Doe",
                email: "john@example.com",
                status: "QUOTED",
                created_at: new Date(),
                updated_at: new Date(),
                provider: { id: "provider-1", name: "Test Provider" },
                quote_items: [
                    {
                        id: "item-1",
                        quote_id: "test-quote-id",
                        name: "Updated Service",
                        description: "Updated description",
                        quantity: 2,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ],
            };

            mockQuoteService.update.mockResolvedValue(updatedQuote);

            const result = await controller.update("test-quote-id", updateDto as any);
            const serialized = plainToInstance(QuoteEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-quote-id");
            expect(serialized.status).toBe("QUOTED");
            expect(quoteService.update).toHaveBeenCalledWith("test-quote-id", updateDto);
        });

        it("should throw exception when user is not owner", async () => {
            const updateDto = { status: "QUOTED" };

            mockQuoteService.update.mockRejectedValue(
                new HttpException("You can only update your own quotes", HttpStatus.FORBIDDEN),
            );

            await expect(controller.update("test-quote-id", updateDto as any)).rejects.toThrow(
                HttpException,
            );
        });
    });

    describe("remove", () => {
        it("should delete and return success message when user is owner", async () => {
            const deletedQuote = {
                id: "quote-to-delete",
                provider_id: "provider-1",
                name: "Quote",
                email: "test@example.com",
                status: "PENDING",
                created_at: new Date(),
                updated_at: new Date(),
                provider: { id: "provider-1", name: "Test Provider" },
                quote_items: [],
            };

            mockQuoteService.remove.mockResolvedValue(deletedQuote);

            const result = await controller.remove("quote-to-delete");

            expect(result).toEqual({
                code: 200,
                message: "Quote deleted successfully",
            });
            expect(quoteService.remove).toHaveBeenCalledWith("quote-to-delete");
        });

        it("should throw exception when user is not owner", async () => {
            mockQuoteService.remove.mockRejectedValue(
                new HttpException("You can only delete your own quotes", HttpStatus.FORBIDDEN),
            );

            await expect(controller.remove("test-quote-id")).rejects.toThrow(HttpException);
        });
    });

    describe("getQuoteMessages", () => {
        it("should return quote messages successfully", async () => {
            const quoteId = "quote-123";
            const params = { getAs: "CLIENT", limit: 20, offset: 0 };
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

            mockQuoteService.getQuoteMessages.mockResolvedValue(mockMessages);

            const result = await controller.getQuoteMessages(quoteId, params as any);

            expect(result).toEqual(mockMessages);
            expect(quoteService.getQuoteMessages).toHaveBeenCalledWith(quoteId, params);
        });

        it("should use CLIENT as default when getAs is not provided", async () => {
            const quoteId = "quote-123";
            const params = {};
            const mockMessages: any[] = [];

            mockQuoteService.getQuoteMessages.mockResolvedValue(mockMessages);

            await controller.getQuoteMessages(quoteId, params as any);

            expect(quoteService.getQuoteMessages).toHaveBeenCalledWith(quoteId, {
                getAs: "CLIENT",
            });
        });

        it("should throw exception when user is forbidden", async () => {
            const quoteId = "quote-123";
            const params = { getAs: "PROVIDER" };

            mockQuoteService.getQuoteMessages.mockRejectedValue(
                new HttpException("Provider does not belong to quote", HttpStatus.FORBIDDEN),
            );

            await expect(controller.getQuoteMessages(quoteId, params as any)).rejects.toThrow(
                HttpException,
            );
        });
    });

    describe("generatePrint", () => {
        it("should generate and return PDF successfully", async () => {
            const quoteId = "quote-123";
            const mockBuffer = Buffer.from("PDF content");
            const mockResponse = {
                set: jest.fn(),
                end: jest.fn(),
            };

            mockQuoteService.generatePrint.mockResolvedValue(mockBuffer);

            await controller.generatePrint(quoteId, mockResponse as any);

            expect(quoteService.generatePrint).toHaveBeenCalledWith(quoteId);
            expect(mockResponse.set).toHaveBeenCalledWith({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="quote-${quoteId}.pdf"`,
                "Content-Length": mockBuffer.length,
            });
            expect(mockResponse.end).toHaveBeenCalledWith(mockBuffer);
        });

        it("should throw exception when quote not found", async () => {
            const quoteId = "non-existent";
            const mockResponse = {
                set: jest.fn(),
                end: jest.fn(),
            };

            mockQuoteService.generatePrint.mockRejectedValue(
                new HttpException("Quote not found", HttpStatus.NOT_FOUND),
            );

            await expect(controller.generatePrint(quoteId, mockResponse as any)).rejects.toThrow(
                HttpException,
            );
        });

        it("should throw exception when provider not found", async () => {
            const quoteId = "quote-123";
            const mockResponse = {
                set: jest.fn(),
                end: jest.fn(),
            };

            mockQuoteService.generatePrint.mockRejectedValue(
                new HttpException("Provider not found", HttpStatus.NOT_FOUND),
            );

            await expect(controller.generatePrint(quoteId, mockResponse as any)).rejects.toThrow(
                HttpException,
            );
        });
    });
});
