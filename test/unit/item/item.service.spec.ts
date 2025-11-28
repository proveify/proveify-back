import { Test, TestingModule } from "@nestjs/testing";
import { ItemService } from "../../../src/item/item.service";
import { ItemPrismaRepository } from "../../../src/item/repositories/item-prisma.repository";
import { FavoritePrismaRepository } from "../../../src/item/repositories/favorite-prisma.repository";
import { FileService } from "../../../src/file/file.service";
import { ItemFactory } from "../../../src/item/factories/item.factory";
import { ClsService } from "nestjs-cls";
import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

const mockItemPrismaRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getTotalSlug: jest.fn(),
};

const mockFavoritePrismaRepository = {
    findMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
};

const mockFileService = {
    save: jest.fn(),
    getFileById: jest.fn(),
    update: jest.fn(),
};

const mockItemFactory = {
    create: jest.fn(),
    createMany: jest.fn(),
};

const mockClsService = {
    get: jest.fn(),
    set: jest.fn(),
};

describe("ItemService", () => {
    let service: ItemService;
    let itemRepository: ItemPrismaRepository;
    let favoriteRepository: FavoritePrismaRepository;
    let fileService: FileService;
    let itemFactory: ItemFactory;
    let clsService: ClsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemService,
                {
                    provide: ItemPrismaRepository,
                    useValue: mockItemPrismaRepository,
                },
                {
                    provide: FavoritePrismaRepository,
                    useValue: mockFavoritePrismaRepository,
                },
                {
                    provide: FileService,
                    useValue: mockFileService,
                },
                {
                    provide: ItemFactory,
                    useValue: mockItemFactory,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
                },
            ],
        }).compile();

        service = module.get<ItemService>(ItemService);
        itemRepository = module.get<ItemPrismaRepository>(ItemPrismaRepository);
        favoriteRepository = module.get<FavoritePrismaRepository>(FavoritePrismaRepository);
        fileService = module.get<FileService>(FileService);
        itemFactory = module.get<ItemFactory>(ItemFactory);
        clsService = module.get<ClsService>(ClsService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("prepareCreate", () => {
        it("should prepare item data for creation", async () => {
            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123-uuid-4567",
                },
            };

            const createDto = {
                name: "Test Item",
                description: "Test Description",
                type: "PRODUCT",
                price: "100.00",
                subcategory_id: "subcategory-123",
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockItemPrismaRepository.getTotalSlug.mockResolvedValue(0);

            const result = await service.prepareCreate(createDto as any);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(result).toMatchObject({
                name: createDto.name,
                description: createDto.description,
                type: createDto.type,
                price: createDto.price,
            });
            expect(result.slug).toBeDefined();
            expect(result.provider).toEqual({ connect: { id: mockUser.provider.id } });
            expect(result.subcategory).toEqual({ connect: { id: createDto.subcategory_id } });
        });

        it("should throw exception when user has no provider", async () => {
            const mockUser = {
                id: "user-123",
                provider: null,
            };

            const createDto = {
                name: "Test Item",
                type: "PRODUCT",
                price: "100.00",
                subcategory_id: "subcategory-123",
            };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.prepareCreate(createDto as any)).rejects.toThrow(
                new HttpException("User not has provider", 400),
            );
        });

        it("should handle images when provided", async () => {
            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123-uuid-4567",
                },
            };

            const createDto = {
                name: "Test Item",
                type: "PRODUCT",
                price: "100.00",
                subcategory_id: "subcategory-123",
                images: [{} as any, {} as any],
            };

            const mockFile = {
                id: "file-123",
                path: "path/to/file",
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockItemPrismaRepository.getTotalSlug.mockResolvedValue(0);
            mockFileService.save.mockResolvedValue(mockFile);

            const result = await service.prepareCreate(createDto as any);

            expect(fileService.save).toHaveBeenCalledTimes(2);
            expect(result.itemImages).toBeDefined();
        });
    });

    describe("prepareUpdate", () => {
        it("should prepare item data for update", async () => {
            const itemId = "item-123";
            const mockUser = {
                id: "user-123",
                provider: {
                    id: "provider-123",
                },
            };

            const mockItem = {
                id: itemId,
                provider_id: "provider-123",
                name: "Old Name",
            };

            const updateDto = {
                name: "Updated Name",
                description: "Updated Description",
                type: "SERVICE",
                price: "200.00",
                subcategory_id: "subcategory-456",
            };

            mockClsService.get.mockReturnValue(mockUser);
            jest.spyOn(service, "findItemById").mockResolvedValue(mockItem as any);

            const result = await service.prepareUpdate(updateDto as any, itemId);

            expect(service.findItemById).toHaveBeenCalledWith(itemId);
            expect(result).toMatchObject({
                name: updateDto.name,
                description: updateDto.description,
                type: updateDto.type,
                price: updateDto.price,
            });
        });

        it("should throw exception when item not found", async () => {
            const itemId = "non-existent-item";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const updateDto = {
                name: "Updated Name",
            };

            mockClsService.get.mockReturnValue(mockUser);
            jest.spyOn(service, "findItemById").mockResolvedValue(null);

            await expect(service.prepareUpdate(updateDto as any, itemId)).rejects.toThrow(
                new HttpException("Item not found", 404),
            );
        });

        it("should throw exception when user tries to update another user's item", async () => {
            const itemId = "item-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const mockItem = {
                id: itemId,
                provider_id: "different-provider-456",
            };

            const updateDto = {
                name: "Updated Name",
            };

            mockClsService.get.mockReturnValue(mockUser);
            jest.spyOn(service, "findItemById").mockResolvedValue(mockItem as any);

            await expect(service.prepareUpdate(updateDto as any, itemId)).rejects.toThrow(
                new HttpException("You can only update your own items", 403),
            );
        });
    });

    describe("createItem", () => {
        it("should create an item successfully", async () => {
            const itemData = {
                name: "Test Item",
                type: "PRODUCT",
                price: "100.00",
            };

            const createdItem = {
                id: "item-123",
                ...itemData,
            };

            const itemEntity = { ...createdItem, formatted: true };

            mockItemPrismaRepository.create.mockResolvedValue(createdItem);
            mockItemFactory.create.mockReturnValue(itemEntity);

            const result = await service.createItem(itemData as any);

            expect(itemRepository.create).toHaveBeenCalledWith({ data: itemData });
            expect(itemFactory.create).toHaveBeenCalledWith(createdItem);
            expect(result).toEqual(itemEntity);
        });
    });

    describe("updateItem", () => {
        it("should update an item successfully", async () => {
            const itemId = "item-123";
            const itemData = {
                name: "Updated Name",
                price: "200.00",
            };

            const updatedItem = {
                id: itemId,
                ...itemData,
            };

            const itemEntity = { ...updatedItem, formatted: true };

            mockItemPrismaRepository.update.mockResolvedValue(updatedItem);
            mockItemFactory.create.mockReturnValue(itemEntity);

            const result = await service.updateItem(itemData as any, itemId);

            expect(itemRepository.update).toHaveBeenCalledWith({
                where: { id: itemId },
                data: itemData,
            });
            expect(itemFactory.create).toHaveBeenCalledWith(updatedItem);
            expect(result).toEqual(itemEntity);
        });
    });

    describe("deleteItem", () => {
        it("should delete an item successfully", async () => {
            const itemId = "item-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const mockItem = {
                id: itemId,
                provider_id: "provider-123",
            };

            const deletedItem = {
                id: itemId,
                name: "Deleted Item",
            };

            const itemEntity = { ...deletedItem, formatted: true };

            mockClsService.get.mockReturnValue(mockUser);
            jest.spyOn(service, "findItemById").mockResolvedValue(mockItem as any);
            mockItemPrismaRepository.delete.mockResolvedValue(deletedItem);
            mockItemFactory.create.mockReturnValue(itemEntity);

            const result = await service.deleteItem(itemId);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(service.findItemById).toHaveBeenCalledWith(itemId);
            expect(itemRepository.delete).toHaveBeenCalledWith({ where: { id: itemId } });
            expect(result).toEqual(itemEntity);
        });

        it("should throw exception when user has no provider", async () => {
            const itemId = "item-123";
            const mockUser = {
                id: "user-123",
                provider: null,
            };

            mockClsService.get.mockReturnValue(mockUser);

            await expect(service.deleteItem(itemId)).rejects.toThrow(
                new HttpException("User not has provider", 400),
            );
        });

        it("should throw exception when item not found", async () => {
            const itemId = "non-existent-item";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            mockClsService.get.mockReturnValue(mockUser);
            jest.spyOn(service, "findItemById").mockResolvedValue(null);

            await expect(service.deleteItem(itemId)).rejects.toThrow(
                new HttpException("Item not found", 404),
            );
        });

        it("should throw exception when user tries to delete another user's item", async () => {
            const itemId = "item-123";
            const mockUser = {
                id: "user-123",
                provider: { id: "provider-123" },
            };

            const mockItem = {
                id: itemId,
                provider_id: "different-provider-456",
            };

            mockClsService.get.mockReturnValue(mockUser);
            jest.spyOn(service, "findItemById").mockResolvedValue(mockItem as any);

            await expect(service.deleteItem(itemId)).rejects.toThrow(
                new HttpException("You can only delete your own items", 403),
            );
        });
    });

    describe("getItems", () => {
        it("should return items with default pagination", async () => {
            const mockItems = [
                { id: "item-1", name: "Item 1" },
                { id: "item-2", name: "Item 2" },
            ];

            const mockItemEntities = mockItems.map((i) => ({ ...i, formatted: true }));

            mockItemPrismaRepository.findMany.mockResolvedValue(mockItems);
            mockItemFactory.createMany.mockReturnValue(mockItemEntities);

            const result = await service.getItems();

            expect(itemRepository.findMany).toHaveBeenCalledWith({
                take: 30,
                skip: undefined,
                orderBy: { id: "desc" },
                where: { type: undefined },
                include: {
                    provider: true,
                    itemImages: true,
                },
            });
            expect(itemFactory.createMany).toHaveBeenCalledWith(mockItems);
            expect(result).toEqual(mockItemEntities);
        });

        it("should filter items by type", async () => {
            const params = {
                type: "PRODUCT",
                limit: 10,
                offset: 5,
                order_by: "asc" as const,
            };

            const mockItems = [{ id: "item-1", type: "PRODUCT" }];
            const mockItemEntities = mockItems.map((i) => ({ ...i, formatted: true }));

            mockItemPrismaRepository.findMany.mockResolvedValue(mockItems);
            mockItemFactory.createMany.mockReturnValue(mockItemEntities);

            const result = await service.getItems(params);

            expect(itemRepository.findMany).toHaveBeenCalledWith({
                take: 10,
                skip: 5,
                orderBy: { id: "asc" },
                where: { type: "PRODUCT" },
                include: {
                    provider: true,
                    itemImages: true,
                },
            });
            expect(result).toEqual(mockItemEntities);
        });
    });

    describe("getItemById", () => {
        it("should return item when it exists", async () => {
            const itemId = "item-123";
            const mockItem = {
                id: itemId,
                name: "Test Item",
            };

            const itemEntity = { ...mockItem, formatted: true };

            mockItemPrismaRepository.findUnique.mockResolvedValue(mockItem);
            mockItemFactory.create.mockReturnValue(itemEntity);

            const result = await service.getItemById(itemId);

            expect(itemRepository.findUnique).toHaveBeenCalledWith({
                where: { id: itemId },
                include: {
                    provider: true,
                    itemImages: true,
                },
            });
            expect(itemFactory.create).toHaveBeenCalledWith(mockItem);
            expect(result).toEqual(itemEntity);
        });

        it("should return null when item does not exist", async () => {
            const itemId = "non-existent-item";

            mockItemPrismaRepository.findUnique.mockResolvedValue(null);

            const result = await service.getItemById(itemId);

            expect(itemRepository.findUnique).toHaveBeenCalledWith({
                where: { id: itemId },
                include: {
                    provider: true,
                    itemImages: true,
                },
            });
            expect(itemFactory.create).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe("addFavorite", () => {
        it("should add item to favorites successfully", async () => {
            const itemId = "item-123";
            const mockUser = {
                id: "user-123",
            };

            const mockFavorite = {
                id: "favorite-123",
                user_id: mockUser.id,
                item_id: itemId,
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockFavoritePrismaRepository.upsert.mockResolvedValue(mockFavorite);

            const result = await service.addFavorite(itemId);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(favoriteRepository.upsert).toHaveBeenCalledWith({
                where: { user_id_item_id: { user_id: mockUser.id, item_id: itemId } },
                update: {},
                create: {
                    user: { connect: { id: mockUser.id } },
                    item: { connect: { id: itemId } },
                },
            });
            expect(result).toBeInstanceOf(Object);
        });

        it("should throw exception when item not found", async () => {
            const itemId = "non-existent-item";
            const mockUser = { id: "user-123" };

            const error = new Prisma.PrismaClientKnownRequestError("Record not found", {
                code: "P2025",
                clientVersion: "5.0.0",
            });

            mockClsService.get.mockReturnValue(mockUser);
            mockFavoritePrismaRepository.upsert.mockRejectedValue(error);

            await expect(service.addFavorite(itemId)).rejects.toThrow(
                new HttpException("Item not found", 404),
            );
        });
    });

    describe("removeFavorite", () => {
        it("should remove item from favorites successfully", async () => {
            const itemId = "item-123";
            const mockUser = {
                id: "user-123",
            };

            const mockFavorite = {
                id: "favorite-123",
                user_id: mockUser.id,
                item_id: itemId,
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockFavoritePrismaRepository.delete.mockResolvedValue(mockFavorite);

            const result = await service.removeFavorite(itemId);

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(favoriteRepository.delete).toHaveBeenCalledWith({
                where: { user_id_item_id: { user_id: mockUser.id, item_id: itemId } },
            });
            expect(result).toBeInstanceOf(Object);
        });

        it("should throw exception when item not in favorites", async () => {
            const itemId = "item-123";
            const mockUser = { id: "user-123" };

            const error = new Prisma.PrismaClientKnownRequestError("Record not found", {
                code: "P2025",
                clientVersion: "5.0.0",
            });

            mockClsService.get.mockReturnValue(mockUser);
            mockFavoritePrismaRepository.delete.mockRejectedValue(error);

            await expect(service.removeFavorite(itemId)).rejects.toThrow(
                new HttpException("Item not found in favorites", 404),
            );
        });
    });

    describe("getFavorites", () => {
        it("should return user favorites with default pagination", async () => {
            const mockUser = {
                id: "user-123",
            };

            const mockFavorites = [
                {
                    id: "favorite-1",
                    user_id: mockUser.id,
                    item_id: "item-1",
                    item: { id: "item-1", name: "Item 1" },
                },
                {
                    id: "favorite-2",
                    user_id: mockUser.id,
                    item_id: "item-2",
                    item: { id: "item-2", name: "Item 2" },
                },
            ];

            mockClsService.get.mockReturnValue(mockUser);
            mockFavoritePrismaRepository.findMany.mockResolvedValue(mockFavorites);

            const result = await service.getFavorites();

            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(favoriteRepository.findMany).toHaveBeenCalledWith({
                where: { user_id: mockUser.id },
                include: { item: true },
                take: 30,
                skip: undefined,
                orderBy: { created_at: "desc" },
            });
            expect(result).toHaveLength(2);
        });

        it("should return favorites with custom pagination", async () => {
            const mockUser = { id: "user-123" };
            const params = {
                limit: 10,
                offset: 5,
                order_by: "asc" as const,
            };

            const mockFavorites = [
                {
                    id: "favorite-1",
                    user_id: mockUser.id,
                    item_id: "item-1",
                },
            ];

            mockClsService.get.mockReturnValue(mockUser);
            mockFavoritePrismaRepository.findMany.mockResolvedValue(mockFavorites);

            const result = await service.getFavorites(params);

            expect(favoriteRepository.findMany).toHaveBeenCalledWith({
                where: { user_id: mockUser.id },
                include: { item: true },
                take: 10,
                skip: 5,
                orderBy: { created_at: "asc" },
            });
            expect(result).toHaveLength(1);
        });
    });

    describe("getProviderItems", () => {
        it("should return items for a specific provider", async () => {
            const providerId = "provider-123";
            const mockItems = [
                { id: "item-1", provider_id: providerId },
                { id: "item-2", provider_id: providerId },
            ];

            const mockItemEntities = mockItems.map((i) => ({ ...i, formatted: true }));

            mockItemPrismaRepository.findMany.mockResolvedValue(mockItems);
            mockItemFactory.createMany.mockReturnValue(mockItemEntities);

            const result = await service.getProviderItems(providerId);

            expect(itemRepository.findMany).toHaveBeenCalledWith({
                where: { provider_id: providerId },
                include: { itemImages: true },
                take: 30,
                skip: undefined,
                orderBy: { created_at: "desc" },
            });
            expect(itemFactory.createMany).toHaveBeenCalledWith(mockItems);
            expect(result).toEqual(mockItemEntities);
        });

        it("should return provider items with custom params", async () => {
            const providerId = "provider-123";
            const params = {
                limit: 5,
                offset: 10,
                order_by: "asc" as const,
            };

            const mockItems = [{ id: "item-1", provider_id: providerId }];
            const mockItemEntities = mockItems.map((i) => ({ ...i, formatted: true }));

            mockItemPrismaRepository.findMany.mockResolvedValue(mockItems);
            mockItemFactory.createMany.mockReturnValue(mockItemEntities);

            const result = await service.getProviderItems(providerId, params);

            expect(itemRepository.findMany).toHaveBeenCalledWith({
                where: { provider_id: providerId },
                include: { itemImages: true },
                take: 5,
                skip: 10,
                orderBy: { created_at: "asc" },
            });
            expect(result).toEqual(mockItemEntities);
        });
    });
});
