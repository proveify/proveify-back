import { Test, TestingModule } from "@nestjs/testing";
import { CategoryService } from "../../../src/category/category.service";
import { CategoryPrismaRepository } from "../../../src/category/repositories/category-prisma.repository";
import { CategoryNotFoundException } from "../../../src/category/exceptions/category-not-found.exception";
import { plainToInstance } from "class-transformer";
import { CategoryEntity } from "../../../src/category/entities/category.entity";
import { HttpException, HttpStatus } from "@nestjs/common";

const mockCategoryPrismaRepository = {
    createCategory: jest.fn(),
    findManyCategories: jest.fn(),
    findUniqueCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
};

describe("CategoryService", () => {
    let service: CategoryService;
    let categoryPrismaRepository: CategoryPrismaRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: CategoryPrismaRepository,
                    useValue: mockCategoryPrismaRepository,
                },
            ],
        }).compile();

        service = module.get<CategoryService>(CategoryService);
        categoryPrismaRepository = module.get<CategoryPrismaRepository>(CategoryPrismaRepository);

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

            mockCategoryPrismaRepository.findUniqueCategory.mockResolvedValue(mockCategory);

            const result = await service.findOne("test-category-id");

            expect(result).toEqual(mockCategory);
            expect(categoryPrismaRepository.findUniqueCategory).toHaveBeenCalledWith(
                "test-category-id",
            );
        });

        it("should return null when category does not exist", async () => {
            mockCategoryPrismaRepository.findUniqueCategory.mockResolvedValue(null);

            const result = await service.findOne("non-existent-id");

            expect(result).toBeNull();
            expect(categoryPrismaRepository.findUniqueCategory).toHaveBeenCalledWith(
                "non-existent-id",
            );
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
                    Subcategories: [],
                },
                {
                    id: "category-2",
                    name: "Category 2",
                    description: "Description 2",
                    created_at: new Date(),
                    updated_at: new Date(),
                    Subcategories: [],
                },
            ];

            mockCategoryPrismaRepository.findManyCategories.mockResolvedValue(mockCategories);

            const result = await service.findAll();

            expect(result).toEqual(mockCategories);
            expect(categoryPrismaRepository.findManyCategories).toHaveBeenCalled();
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

            mockCategoryPrismaRepository.createCategory.mockResolvedValue(createdCategory);

            const result = await service.create(categoryData);

            expect(result).toEqual(createdCategory);
            expect(categoryPrismaRepository.createCategory).toHaveBeenCalledWith(categoryData);
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

            mockCategoryPrismaRepository.findUniqueCategory.mockResolvedValue({
                id: categoryId,
                name: "Original Name",
                description: "Original Description",
                created_at: new Date(),
                updated_at: new Date(),
            });

            mockCategoryPrismaRepository.updateCategory.mockResolvedValue(updatedCategory);

            const result = await service.update(categoryId, updateData);

            expect(result).toEqual(updatedCategory);
            expect(categoryPrismaRepository.findUniqueCategory).toHaveBeenCalledWith(categoryId);
            expect(categoryPrismaRepository.updateCategory).toHaveBeenCalledWith(
                categoryId,
                updateData,
            );
        });

        it("should throw an exception when category does not exist", async () => {
            const categoryId = "non-existent-category";
            const updateData = { name: "Updated" };

            mockCategoryPrismaRepository.findUniqueCategory.mockResolvedValue(null);

            await expect(service.update(categoryId, updateData)).rejects.toThrow(
                new HttpException("Category not found", HttpStatus.NOT_FOUND),
            );
            expect(categoryPrismaRepository.findUniqueCategory).toHaveBeenCalledWith(categoryId);
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

            mockCategoryPrismaRepository.findUniqueCategory.mockResolvedValue({
                id: categoryId,
                name: "Category",
                description: "Description",
                created_at: new Date(),
                updated_at: new Date(),
            });

            mockCategoryPrismaRepository.deleteCategory.mockResolvedValue(deletedCategory);

            const result = await service.remove(categoryId);

            expect(result).toEqual(deletedCategory);
            expect(categoryPrismaRepository.findUniqueCategory).toHaveBeenCalledWith(categoryId);
            expect(categoryPrismaRepository.deleteCategory).toHaveBeenCalledWith(categoryId);
        });

        it("should throw an exception when category does not exist", async () => {
            const categoryId = "non-existent-category";

            mockCategoryPrismaRepository.findUniqueCategory.mockResolvedValue(null);

            await expect(service.remove(categoryId)).rejects.toThrow(
                new HttpException("Category not found", HttpStatus.NOT_FOUND),
            );
            expect(categoryPrismaRepository.findUniqueCategory).toHaveBeenCalledWith(categoryId);
        });
    });
});
