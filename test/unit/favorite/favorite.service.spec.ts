import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteService } from "../../../src/favorite/favorite.service";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

const mockPrismaService = {
    favorites: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
};

describe("FavoriteService", () => {
    let service: FavoriteService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoriteService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<FavoriteService>(FavoriteService);
        prismaService = module.get<PrismaService>(PrismaService);
        
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("addFavorite", () => {
        it("should add an item to favorites successfully", async () => {
            const mockFavorite = {
                id: "favorite-id",
                user_id: "user-id",
                item_id: "item-id",
                created_at: new Date(),
            };

            mockPrismaService.favorites.upsert.mockResolvedValue(mockFavorite);

            const result = await service.addFavorite("user-id", "item-id");

            expect(result).toEqual(mockFavorite);
            expect(prismaService.favorites.upsert).toHaveBeenCalledWith({
                where: {
                    user_id_item_id: {
                        user_id: "user-id",
                        item_id: "item-id",
                    },
                },
                update: {},
                create: {
                    user: { connect: { id: "user-id" } },
                    item: { connect: { id: "item-id" } },
                },
            });
        });

        it("should throw HttpException when item not found", async () => {
            const error = new Prisma.PrismaClientKnownRequestError("Item not found", {
                code: "P2025",
                clientVersion: "1.0.0"
            });

            mockPrismaService.favorites.upsert.mockRejectedValue(error);

            await expect(service.addFavorite("user-id", "item-id")).rejects.toThrow(
                new HttpException("Item not found", 404)
            );
        });

        it("should throw HttpException when invalid IDs provided", async () => {
            const error = new Prisma.PrismaClientKnownRequestError("Invalid ID", {
                code: "P2003",
                clientVersion: "1.0.0"
            });

            mockPrismaService.favorites.upsert.mockRejectedValue(error);

            await expect(service.addFavorite("invalid-user", "invalid-item")).rejects.toThrow(
                new HttpException("Invalid item or user ID", 400)
            );
        });

        it("should handle generic errors", async () => {
            mockPrismaService.favorites.upsert.mockRejectedValue(new Error("Database error"));

            await expect(service.addFavorite("user-id", "item-id")).rejects.toThrow(
                new HttpException("Failed to add item to favorites", 400)
            );
        });
    });

    describe("removeFavorite", () => {
        it("should remove an item from favorites successfully", async () => {
            const mockFavorite = {
                id: "favorite-id",
                user_id: "user-id",
                item_id: "item-id",
                created_at: new Date(),
            };

            mockPrismaService.favorites.delete.mockResolvedValue(mockFavorite);

            const result = await service.removeFavorite("user-id", "item-id");

            expect(result).toEqual(mockFavorite);
            expect(prismaService.favorites.delete).toHaveBeenCalledWith({
                where: {
                    user_id_item_id: {
                        user_id: "user-id",
                        item_id: "item-id",
                    },
                },
            });
        });

        it("should throw HttpException when favorite not found", async () => {
            const error = new Prisma.PrismaClientKnownRequestError("Favorite not found", {
                code: "P2025",
                clientVersion: "1.0.0"
            });

            mockPrismaService.favorites.delete.mockRejectedValue(error);

            await expect(service.removeFavorite("user-id", "item-id")).rejects.toThrow(
                new HttpException("Item not found in favorites", 404)
            );
        });

        it("should handle generic errors when removing favorite", async () => {
            mockPrismaService.favorites.delete.mockRejectedValue(new Error("Database error"));

            await expect(service.removeFavorite("user-id", "item-id")).rejects.toThrow(
                new HttpException("Failed to remove item from favorites", 400)
            );
        });
    });

    describe("getFavorites", () => {
        it("should return favorites with default parameters", async () => {
            const mockFavorites = [
                {
                    id: "favorite-1",
                    user_id: "user-id",
                    item_id: "item-1",
                    created_at: new Date(),
                    item: { id: "item-1", name: "Item 1" },
                },
                {
                    id: "favorite-2",
                    user_id: "user-id",
                    item_id: "item-2",
                    created_at: new Date(),
                    item: { id: "item-2", name: "Item 2" },
                },
            ];

            mockPrismaService.favorites.findMany.mockResolvedValue(mockFavorites);

            const result = await service.getFavorites("user-id");

            expect(result).toEqual(mockFavorites);
            expect(prismaService.favorites.findMany).toHaveBeenCalledWith({
                where: { user_id: "user-id" },
                include: { item: true },
                take: 30,
                skip: undefined,
                orderBy: { created_at: "desc" },
            });
        });

        it("should return favorites with custom parameters", async () => {
            const mockFavorites = [
                {
                    id: "favorite-1",
                    user_id: "user-id",
                    item_id: "item-1",
                    created_at: new Date(),
                    item: { id: "item-1", name: "Item 1" },
                },
            ];

            mockPrismaService.favorites.findMany.mockResolvedValue(mockFavorites);

            const params = { limit: 10, offset: 5, order_by: "asc" as const };
            const result = await service.getFavorites("user-id", params);

            expect(result).toEqual(mockFavorites);
            expect(prismaService.favorites.findMany).toHaveBeenCalledWith({
                where: { user_id: "user-id" },
                include: { item: true },
                take: 10,
                skip: 5,
                orderBy: { created_at: "asc" },
            });
        });
    });

    describe("isFavorite", () => {
        it("should return true when item is favorite", async () => {
            mockPrismaService.favorites.count.mockResolvedValue(1);

            const result = await service.isFavorite("user-id", "item-id");

            expect(result).toBe(true);
            expect(prismaService.favorites.count).toHaveBeenCalledWith({
                where: {
                    user_id: "user-id",
                    item_id: "item-id",
                },
            });
        });

        it("should return false when item is not favorite", async () => {
            mockPrismaService.favorites.count.mockResolvedValue(0);

            const result = await service.isFavorite("user-id", "item-id");

            expect(result).toBe(false);
            expect(prismaService.favorites.count).toHaveBeenCalledWith({
                where: {
                    user_id: "user-id",
                    item_id: "item-id",
                },
            });
        });
    });
});
