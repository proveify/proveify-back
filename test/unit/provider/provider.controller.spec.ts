import { Test, TestingModule } from "@nestjs/testing";
import { ProviderController } from "../../../src/provider/provider.controller";
import { ProviderService } from "../../../src/provider/provider.service";
import { ClassSerializerInterceptor, HttpException } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { OptionalJwtAuthGuard } from "../../../src/auth/guards/optional-jwt.guard";
import { Reflector } from "@nestjs/core";
import { ProviderEntity } from "../../../src/provider/entities/provider.entity";
import { NestjsFormDataModule } from "nestjs-form-data";

const mockProviderService = {
    getProviders: jest.fn(),
    getProviderById: jest.fn(),
    updateProvider: jest.fn(),
};

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

describe("ProviderController", () => {
    let controller: ProviderController;
    let providerService: ProviderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [NestjsFormDataModule.config({ isGlobal: true })],
            controllers: [ProviderController],
            providers: [
                {
                    provide: ProviderService,
                    useValue: mockProviderService,
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
            .compile();

        controller = module.get<ProviderController>(ProviderController);
        providerService = module.get<ProviderService>(ProviderService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getProviders", () => {
        it("should return an array of providers with default params", async () => {
            const mockProviders = [
                {
                    id: "provider-1",
                    name: "Provider 1",
                    email: "provider1@example.com",
                },
                {
                    id: "provider-2",
                    name: "Provider 2",
                    email: "provider2@example.com",
                },
            ];

            mockProviderService.getProviders.mockResolvedValue(mockProviders);

            const result = await controller.getProviders({});

            expect(providerService.getProviders).toHaveBeenCalledWith({});
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(ProviderEntity);
            expect(result[1]).toBeInstanceOf(ProviderEntity);
        });

        it("should return providers with custom params", async () => {
            const params = {
                limit: 10,
                offset: 5,
                order_by: "asc" as const,
            };

            const mockProviders = [
                {
                    id: "provider-1",
                    name: "Provider 1",
                },
            ];

            mockProviderService.getProviders.mockResolvedValue(mockProviders);

            const result = await controller.getProviders(params);

            expect(providerService.getProviders).toHaveBeenCalledWith(params);
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(ProviderEntity);
        });
    });

    describe("getProviderById", () => {
        it("should return a provider when it exists", async () => {
            const providerId = "provider-123";
            const mockProvider = {
                id: providerId,
                name: "Test Provider",
                email: "provider@example.com",
                identification: "123456",
                identification_type: "NIT",
            };

            mockProviderService.getProviderById.mockResolvedValue(mockProvider);

            const result = await controller.getProviderById({ id: providerId });

            expect(providerService.getProviderById).toHaveBeenCalledWith(providerId);
            expect(result).toEqual(mockProvider);
        });

        it("should throw HttpException when provider does not exist", async () => {
            const providerId = "non-existent-id";

            mockProviderService.getProviderById.mockResolvedValue(null);

            await expect(controller.getProviderById({ id: providerId })).rejects.toThrow(
                new HttpException("Provider not found", 404),
            );
            expect(providerService.getProviderById).toHaveBeenCalledWith(providerId);
        });
    });

    describe("updateProvider", () => {
        it("should update provider successfully", async () => {
            const updateData = {
                name: "Updated Provider",
                email: "updated@example.com",
                identification: "654321",
                identification_type: "NIT",
            };

            const updatedProvider = {
                id: "provider-123",
                ...updateData,
            };

            mockProviderService.updateProvider.mockResolvedValue(updatedProvider);

            const result = await controller.updateProvider(updateData as any);

            expect(providerService.updateProvider).toHaveBeenCalledWith(updateData);
            expect(result).toEqual(updatedProvider);
        });

        it("should update provider with file fields", async () => {
            const updateData = {
                name: "Updated Provider",
                rut: {} as any,
                chamber_commerce: {} as any,
                profile_picture: {} as any,
            };

            const updatedProvider = {
                id: "provider-123",
                name: updateData.name,
            };

            mockProviderService.updateProvider.mockResolvedValue(updatedProvider);

            const result = await controller.updateProvider(updateData as any);

            expect(providerService.updateProvider).toHaveBeenCalledWith(updateData);
            expect(result).toEqual(updatedProvider);
        });
    });
});
