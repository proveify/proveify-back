import { Test, TestingModule } from "@nestjs/testing";
import { CategoryService } from "../../../src/category/category.service";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { CategoryNotFoundException } from "../../../src/category/exceptions/category-not-found.exception";
import { plainToInstance } from "class-transformer";
import { CategoryEntity } from "../../../src/category/entities/category.entity";
import { HttpException, HttpStatus } from "@nestjs/common";

const mockPrismaService = {
    categories: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe("CategoryService", () => {
    let service: CategoryService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<CategoryService>(CategoryService);
        prismaService = module.get<PrismaService>(PrismaService);
        
        // Reset mocks between tests
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findOne", () => {
        it("should return a category when it exists", async () => {
            const mockCategory = {
                id: "test-category-id",
                name: "Test Category",
                description: "Test Description",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);

            const result = await service.findOne("test-category-id");

            expect(result).toEqual(mockCategory);
            expect(prismaService.categories.findUnique).toHaveBeenCalledWith({
                where: { id: "test-category-id" },
                include: { Subcategories: true }
            });
        });

        it("should return null when category does not exist", async () => {
            mockPrismaService.categories.findUnique.mockResolvedValue(null);

            const result = await service.findOne("non-existent-id");

            expect(result).toBeNull();
            expect(prismaService.categories.findUnique).toHaveBeenCalledWith({
                where: { id: "non-existent-id" },
                include: { Subcategories: true }
            });
        });
    });

    describe("findAll", () => {
        it("should return an array of categories", async () => {
            const mockCategories = [
                {
                    id: "category-1",
                    name: "Category 1",
                    description: "Description 1",
                    created_at: new Date(),
                    updated_at: new Date(),
                    Subcategories: []
                },
                {
                    id: "category-2",
                    name: "Category 2",
                    description: "Description 2",
                    created_at: new Date(),
                    updated_at: new Date(),
                    Subcategories: []
                },
            ];

            mockPrismaService.categories.findMany.mockResolvedValue(mockCategories);

            const result = await service.findAll();

            expect(result).toEqual(mockCategories);
            expect(prismaService.categories.findMany).toHaveBeenCalledWith({
                include: { Subcategories: true }
            });
        });
    });

    describe("create", () => {
        it("should create and return a new category", async () => {
            const categoryData = {
                name: "New Category",
                description: "New Description",
            };

            const createdCategory = {
                id: "new-category-id",
                ...categoryData,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPrismaService.categories.create.mockResolvedValue(createdCategory);

            const result = await service.create(categoryData);

            expect(result).toEqual(createdCategory);
            expect(prismaService.categories.create).toHaveBeenCalledWith({
                data: categoryData,
            });
        });
    });

    describe("update", () => {
        it("should update and return a category when it exists", async () => {
            const categoryId = "category-to-update";
            const updateData = {
                name: "Updated Name",
                description: "Updated Description",
            };

            const updatedCategory = {
                id: categoryId,
                ...updateData,
                created_at: new Date(),
                updated_at: new Date(),
            };

            jest.spyOn(service, 'findOne').mockResolvedValue({
                id: categoryId,
                name: "Original Name",
                description: "Original Description",
                created_at: new Date(),
                updated_at: new Date(),
            });
            
            mockPrismaService.categories.update.mockResolvedValue(updatedCategory);

            const result = await service.update(categoryId, updateData);

            expect(result).toEqual(updatedCategory);
            expect(service.findOne).toHaveBeenCalledWith(categoryId);
            expect(prismaService.categories.update).toHaveBeenCalledWith({
                where: { id: categoryId },
                data: updateData,
            });
        });

        it("should throw an exception when category does not exist", async () => {
            const categoryId = "non-existent-category";
            const updateData = { name: "Updated" };

            jest.spyOn(service, 'findOne').mockResolvedValue(null);

            await expect(service.update(categoryId, updateData)).rejects.toThrow(
                new HttpException("Category not found", HttpStatus.NOT_FOUND)
            );
            expect(service.findOne).toHaveBeenCalledWith(categoryId);
        });
    });

    describe("remove", () => {
        it("should delete and return a category when it exists", async () => {
            const categoryId = "category-to-delete";
            const deletedCategory = {
                id: categoryId,
                name: "Category",
                description: "Description",
                created_at: new Date(),
                updated_at: new Date(),
            };

            jest.spyOn(service, 'findOne').mockResolvedValue({
                id: categoryId,
                name: "Category",
                description: "Description",
                created_at: new Date(),
                updated_at: new Date(),
            });
            
            mockPrismaService.categories.delete.mockResolvedValue(deletedCategory);

            const result = await service.remove(categoryId);

            expect(result).toEqual(deletedCategory);
            expect(service.findOne).toHaveBeenCalledWith(categoryId);
            expect(prismaService.categories.delete).toHaveBeenCalledWith({
                where: { id: categoryId },
            });
        });

        it("should throw an exception when category does not exist", async () => {
            const categoryId = "non-existent-category";

            jest.spyOn(service, 'findOne').mockResolvedValue(null);

            await expect(service.remove(categoryId)).rejects.toThrow(
                new HttpException("Category not found", HttpStatus.NOT_FOUND)
            );
            expect(service.findOne).toHaveBeenCalledWith(categoryId);
        });
    });
});