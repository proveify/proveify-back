import { Test, TestingModule } from "@nestjs/testing";
import { ProviderService } from "../../../src/provider/provider.service";
import { ProviderPrismaRepository } from "../../../src/provider/repositories/provider-prisma.repository";
import { FileService } from "../../../src/file/file.service";
import { ProviderFactory } from "../../../src/provider/factories/provider.factory";
import { ClsService } from "nestjs-cls";
import { HttpException } from "@nestjs/common";
import { ResourceType } from "../../../src/file/interfaces/file-manager.interface";

const mockProviderPrismaRepository = {
    createProvider: jest.fn(),
    findManyProviders: jest.fn(),
    findUniqueProvider: jest.fn(),
    updateProvider: jest.fn(),
};

const mockFileService = {
    save: jest.fn(),
    getFileById: jest.fn(),
    update: jest.fn(),
};

const mockProviderFactory = {
    create: jest.fn(),
    createMany: jest.fn(),
};

const mockClsService = {
    get: jest.fn(),
    set: jest.fn(),
};

describe("ProviderService", () => {
    let service: ProviderService;
    let providerRepository: ProviderPrismaRepository;
    let fileService: FileService;
    let providerFactory: ProviderFactory;
    let clsService: ClsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProviderService,
                {
                    provide: ProviderPrismaRepository,
                    useValue: mockProviderPrismaRepository,
                },
                {
                    provide: FileService,
                    useValue: mockFileService,
                },
                {
                    provide: ProviderFactory,
                    useValue: mockProviderFactory,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
                },
            ],
        }).compile();

        service = module.get<ProviderService>(ProviderService);
        providerRepository = module.get<ProviderPrismaRepository>(ProviderPrismaRepository);
        fileService = module.get<FileService>(FileService);
        providerFactory = module.get<ProviderFactory>(ProviderFactory);
        clsService = module.get<ClsService>(ClsService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("saveProvider", () => {
        it("should save a provider successfully", async () => {
            const providerData = {
                name: "Test Provider",
                email: "provider@example.com",
                identification: "123456",
                identification_type: "NIT",
                rut: "rut-file-id",
                chamber_commerce: "chamber-file-id",
                user: {
                    connect: { id: "user-123" },
                },
                plan: {
                    connect: { id: "plan-123" },
                },
            };

            const savedProvider = {
                id: "provider-123",
                ...providerData,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockProviderPrismaRepository.createProvider.mockResolvedValue(savedProvider);

            const result = await service.saveProvider(providerData);

            expect(providerRepository.createProvider).toHaveBeenCalledWith(providerData);
            expect(result).toEqual(savedProvider);
        });
    });

    describe("getProviders", () => {
        it("should return providers with default pagination", async () => {
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

            const mockProviderEntities = mockProviders.map((p) => ({ ...p, formatted: true }));

            mockProviderPrismaRepository.findManyProviders.mockResolvedValue(mockProviders);
            mockProviderFactory.createMany.mockReturnValue(mockProviderEntities);

            const result = await service.getProviders();

            expect(providerRepository.findManyProviders).toHaveBeenCalledWith(
                undefined,
                30,
                undefined,
                { id: "desc" },
            );
            expect(providerFactory.createMany).toHaveBeenCalledWith(mockProviders);
            expect(result).toEqual(mockProviderEntities);
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

            const mockProviderEntities = mockProviders.map((p) => ({ ...p, formatted: true }));

            mockProviderPrismaRepository.findManyProviders.mockResolvedValue(mockProviders);
            mockProviderFactory.createMany.mockReturnValue(mockProviderEntities);

            const result = await service.getProviders(params);

            expect(providerRepository.findManyProviders).toHaveBeenCalledWith(undefined, 10, 5, {
                id: "asc",
            });
            expect(result).toEqual(mockProviderEntities);
        });
    });

    describe("getProviderById", () => {
        it("should return a provider when it exists", async () => {
            const providerId = "provider-123";
            const mockProvider = {
                id: providerId,
                name: "Test Provider",
                email: "provider@example.com",
            };

            const mockProviderEntity = { ...mockProvider, formatted: true };

            mockProviderPrismaRepository.findUniqueProvider.mockResolvedValue(mockProvider);
            mockProviderFactory.create.mockReturnValue(mockProviderEntity);

            const result = await service.getProviderById(providerId);

            expect(providerRepository.findUniqueProvider).toHaveBeenCalledWith(providerId);
            expect(providerFactory.create).toHaveBeenCalledWith(mockProvider);
            expect(result).toEqual(mockProviderEntity);
        });

        it("should return null when provider does not exist", async () => {
            const providerId = "non-existent-id";

            mockProviderPrismaRepository.findUniqueProvider.mockResolvedValue(null);

            const result = await service.getProviderById(providerId);

            expect(providerRepository.findUniqueProvider).toHaveBeenCalledWith(providerId);
            expect(providerFactory.create).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe("updateProvider", () => {
        it("should update provider with basic fields", async () => {
            const updateData = {
                name: "Updated Provider",
                email: "updated@example.com",
                identification: "654321",
                identification_type: "NIT",
            };

            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123",
                    name: "Original Provider",
                    rut: "rut-file-id",
                    chamber_commerce: "chamber-file-id",
                },
            };

            const updatedProvider = {
                id: "provider-123",
                ...updateData,
            };

            const updatedProviderEntity = { ...updatedProvider, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockProviderPrismaRepository.updateProvider.mockResolvedValue(updatedProvider);
            mockProviderFactory.create.mockReturnValue(updatedProviderEntity);

            const result = await service.updateProvider(updateData);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(providerRepository.updateProvider).toHaveBeenCalledWith("provider-123", {
                name: updateData.name,
                email: updateData.email,
                identification: updateData.identification,
                identification_type: updateData.identification_type,
            });
            expect(providerFactory.create).toHaveBeenCalledWith(updatedProvider);
            expect(result).toEqual(updatedProviderEntity);
        });

        it("should throw exception when user has no provider", async () => {
            const updateData = {
                name: "Updated Provider",
            };

            const mockUser = {
                id: "user-123",
                provider: null,
            };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.updateProvider(updateData)).rejects.toThrow(
                new HttpException("Provider not found", 404),
            );
        });

        it("should update chamber_commerce file when provided", async () => {
            const updateData = {
                chamber_commerce: {} as any,
            };

            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123",
                    chamber_commerce: "existing-chamber-file-id",
                    rut: "rut-file-id",
                },
            };

            const existingFile = {
                id: "existing-chamber-file-id",
                path: "existing-path",
            };

            const updatedProvider = {
                id: "provider-123",
                name: "Provider",
            };

            const updatedProviderEntity = { ...updatedProvider, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockFileService.getFileById.mockResolvedValue(existingFile);
            mockFileService.update.mockResolvedValue(undefined);
            mockProviderPrismaRepository.updateProvider.mockResolvedValue(updatedProvider);
            mockProviderFactory.create.mockReturnValue(updatedProviderEntity);

            const result = await service.updateProvider(updateData);

            expect(fileService.getFileById).toHaveBeenCalledWith("existing-chamber-file-id");
            expect(fileService.update).toHaveBeenCalledWith(
                existingFile,
                updateData.chamber_commerce,
                existingFile.path,
            );
            expect(result).toEqual(updatedProviderEntity);
        });

        it("should create new chamber_commerce file when it doesn't exist", async () => {
            const updateData = {
                chamber_commerce: {} as any,
            };

            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123",
                    chamber_commerce: "non-existent-file-id",
                    rut: "rut-file-id",
                },
            };

            const newFile = {
                id: "new-chamber-file-id",
                path: "new-path",
            };

            const updatedProvider = {
                id: "provider-123",
                name: "Provider",
            };

            const updatedProviderEntity = { ...updatedProvider, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockFileService.getFileById.mockResolvedValue(null);
            mockFileService.save.mockResolvedValue(newFile);
            mockProviderPrismaRepository.updateProvider.mockResolvedValue(updatedProvider);
            mockProviderFactory.create.mockReturnValue(updatedProviderEntity);

            const result = await service.updateProvider(updateData);

            expect(fileService.getFileById).toHaveBeenCalledWith("non-existent-file-id");
            expect(fileService.save).toHaveBeenCalledWith(
                updateData.chamber_commerce,
                ResourceType.CHAMBER_COMMERCE,
            );
            expect(providerRepository.updateProvider).toHaveBeenCalledWith("provider-123", {
                chamber_commerce: newFile.id,
            });
            expect(result).toEqual(updatedProviderEntity);
        });

        it("should update rut file when provided", async () => {
            const updateData = {
                rut: {} as any,
            };

            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123",
                    rut: "existing-rut-file-id",
                    chamber_commerce: "chamber-file-id",
                },
            };

            const existingFile = {
                id: "existing-rut-file-id",
                path: "existing-rut-path",
            };

            const updatedProvider = {
                id: "provider-123",
                name: "Provider",
            };

            const updatedProviderEntity = { ...updatedProvider, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockFileService.getFileById.mockResolvedValue(existingFile);
            mockFileService.update.mockResolvedValue(undefined);
            mockProviderPrismaRepository.updateProvider.mockResolvedValue(updatedProvider);
            mockProviderFactory.create.mockReturnValue(updatedProviderEntity);

            const result = await service.updateProvider(updateData);

            expect(fileService.getFileById).toHaveBeenCalledWith("existing-rut-file-id");
            expect(fileService.update).toHaveBeenCalledWith(
                existingFile,
                updateData.rut,
                existingFile.path,
            );
            expect(result).toEqual(updatedProviderEntity);
        });

        it("should update profile_picture when provided", async () => {
            const updateData = {
                profile_picture: {} as any,
            };

            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123",
                    profile_picture: "existing-profile-pic-id",
                    rut: "rut-file-id",
                    chamber_commerce: "chamber-file-id",
                },
            };

            const existingFile = {
                id: "existing-profile-pic-id",
                path: "existing-pic-path",
            };

            const updatedProvider = {
                id: "provider-123",
                name: "Provider",
            };

            const updatedProviderEntity = { ...updatedProvider, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            mockFileService.getFileById.mockResolvedValue(existingFile);
            mockFileService.update.mockResolvedValue(undefined);
            mockProviderPrismaRepository.updateProvider.mockResolvedValue(updatedProvider);
            mockProviderFactory.create.mockReturnValue(updatedProviderEntity);

            const result = await service.updateProvider(updateData);

            expect(fileService.getFileById).toHaveBeenCalledWith("existing-profile-pic-id");
            expect(fileService.update).toHaveBeenCalledWith(
                existingFile,
                updateData.profile_picture,
                existingFile.path,
            );
            expect(result).toEqual(updatedProviderEntity);
        });
    });
});
