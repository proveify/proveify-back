import { Test, TestingModule } from "@nestjs/testing";
import { ItemService } from "../../../src/item/item.service";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { AuthContextService } from "../../../src/auth/auth-context.service";
import { FileService } from "../../../src/file/file.service";

const mockPrismaService = {
    items: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    favorites: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    }
};

const mockAuthContextService = {
    getProvider: jest.fn(),
    getUser: jest.fn(),
};

const mockFileService = {
    save: jest.fn(),
    getFileById: jest.fn(),
    update: jest.fn(),
};

describe("ItemService", () => {
    let service: ItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AuthContextService, useValue: mockAuthContextService },
                { provide: FileService, useValue: mockFileService },
            ],
        }).compile();

        service = module.get<ItemService>(ItemService);
        jest.clearAllMocks();
    });

    describe("getItemsWithFavoriteInfo", () => {
        it("should return items with favorite status when user provided", async () => {
            const mockItems = [
                { id: "item-1", name: "Item 1", created_at: new Date() },
                { id: "item-2", name: "Item 2", created_at: new Date() },
            ];

            const mockFavorites = [
                { item_id: "item-1", user_id: "user-1" },
            ];

            mockPrismaService.items.findMany.mockResolvedValue(mockItems);
            mockPrismaService.favorites.findMany.mockResolvedValue(mockFavorites);

            const result = await service.getItemsWithFavoriteInfo({}, "user-1");

            expect(result).toHaveLength(2);
            expect(result[0].isFavorite).toBe(true);
            expect(result[1].isFavorite).toBe(false);
            expect(mockPrismaService.favorites.findMany).toHaveBeenCalled();
        });

        it("should return items with isFavorite false when no user provided", async () => {
            const mockItems = [
                { id: "item-1", name: "Item 1", created_at: new Date() },
            ];

            mockPrismaService.items.findMany.mockResolvedValue(mockItems);

            const result = await service.getItemsWithFavoriteInfo({});

            expect(result[0].isFavorite).toBe(false);
            expect(mockPrismaService.favorites.findMany).not.toHaveBeenCalled();
        });
    });

    describe("findItemByIdWithFavoriteInfo", () => {
        it("should return item with favorite status when user provided", async () => {
            const mockItem = { id: "item-1", name: "Item 1", created_at: new Date() };

            mockPrismaService.items.findUnique.mockResolvedValue(mockItem);
            mockPrismaService.favorites.count.mockResolvedValue(1);

            const result = await service.findItemByIdWithFavoriteInfo("item-1", "user-1");

            expect(result?.isFavorite).toBe(true);
            expect(mockPrismaService.favorites.count).toHaveBeenCalled();
        });

        it("should return null when item not found", async () => {
            mockPrismaService.items.findUnique.mockResolvedValue(null);

            const result = await service.findItemByIdWithFavoriteInfo("non-existent", "user-1");

            expect(result).toBeNull();
            expect(mockPrismaService.favorites.count).not.toHaveBeenCalled();
        });

        it("should return item with isFavorite false when no user provided", async () => {
            const mockItem = { id: "item-1", name: "Item 1", created_at: new Date() };

            mockPrismaService.items.findUnique.mockResolvedValue(mockItem);

            const result = await service.findItemByIdWithFavoriteInfo("item-1");

            expect(result?.isFavorite).toBe(false);
            expect(mockPrismaService.favorites.count).not.toHaveBeenCalled();
        });
    });
});
