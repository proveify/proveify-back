import { Test, TestingModule } from "@nestjs/testing";
import { SubcategoryService } from "../../../src/subcategory/subcategory.service";
import { SubcategoryPrismaRepository } from "../../../src/subcategory/repositories/subcategory-prisma.repository";
import { SubcategoryNotFoundException } from "../../../src/subcategory/exceptions/subcategory-not-found.exception";
import { plainToInstance } from "class-transformer";
import { SubcategoryEntity } from "../../../src/subcategory/entities/subcategory.entity";
import { CategoryService } from "../../../src/category/category.service";
import { CategoryNotFoundException } from "../../../src/category/exceptions/category-not-found.exception";
import { HttpException, HttpStatus } from "@nestjs/common";

const mockSubcategoryPrismaRepository = {
    createSubcategory: jest.fn(),
    findManySubcategories: jest.fn(),
    findUniqueSubcategory: jest.fn(),
    findSubcategoriesByCategory: jest.fn(),
    updateSubcategory: jest.fn(),
    deleteSubcategory: jest.fn(),
};

const mockCategoryService = {
    findOne: jest.fn(),
};

describe("SubcategoryService", () => {
    let service: SubcategoryService;
    let subcategoryPrismaRepository: SubcategoryPrismaRepository;
    let categoryService: CategoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubcategoryService,
                {
                    provide: SubcategoryPrismaRepository,
                    useValue: mockSubcategoryPrismaRepository,
                },
                {
                    provide: CategoryService,
                    useValue: mockCategoryService,
                },
            ],
        }).compile();

        service = module.get<SubcategoryService>(SubcategoryService);
        subcategoryPrismaRepository = module.get<SubcategoryPrismaRepository>(
            SubcategoryPrismaRepository,
        );
        categoryService = module.get<CategoryService>(CategoryService);

        jest.clearAllMocks();

        jest.spyOn(service, "findByCategoryId");

        jest.spyOn(service, "create");

        jest.spyOn(service, "update");
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findOne", () => {
        it("should return a subcategory when it exists", async () => {
            const mockSubcategory = {
                id: "test-subcategory-id",
                name: "Test Subcategory",
                description: "Test Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryPrismaRepository.findUniqueSubcategory.mockResolvedValue(
                mockSubcategory,
            );

            const result = await service.findOne("test-subcategory-id");

            expect(result).toEqual(mockSubcategory);
            expect(subcategoryPrismaRepository.findUniqueSubcategory).toHaveBeenCalledWith(
                "test-subcategory-id",
            );
        });

        it("should return null when subcategory does not exist", async () => {
            mockSubcategoryPrismaRepository.findUniqueSubcategory.mockResolvedValue(null);

            const result = await service.findOne("non-existent-id");

            expect(result).toBeNull();
            expect(subcategoryPrismaRepository.findUniqueSubcategory).toHaveBeenCalledWith(
                "non-existent-id",
            );
        });
    });

    describe("findAll", () => {
        it("should return all subcategories", async () => {
            const mockSubcategories = [
                {
                    id: "subcategory-1",
                    name: "Subcategory 1",
                    description: "Description 1",
                    category: { id: "category-1", name: "Category 1" },
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: "subcategory-2",
                    name: "Subcategory 2",
                    description: "Description 2",
                    category: { id: "category-2", name: "Category 2" },
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockSubcategoryPrismaRepository.findManySubcategories.mockResolvedValue(
                mockSubcategories,
            );

            const result = await service.findAll();

            expect(result).toEqual(mockSubcategories);
            expect(subcategoryPrismaRepository.findManySubcategories).toHaveBeenCalled();
        });
    });

    describe("findByCategoryId", () => {
        it("should return subcategories filtered by categoryId when category exists", async () => {
            const categoryId = "test-category-id";
            const mockSubcategories = [
                {
                    id: "subcategory-1",
                    name: "Subcategory 1",
                    description: "Description 1",
                    category: { id: categoryId, name: "Test Category" },
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockSubcategoryPrismaRepository.findSubcategoriesByCategory.mockResolvedValue(
                mockSubcategories,
            );

            const result = await service.findByCategoryId(categoryId);

            expect(result).toEqual(mockSubcategories);
            expect(subcategoryPrismaRepository.findSubcategoriesByCategory).toHaveBeenCalledWith(
                categoryId,
            );
        });

        it("should return empty array when no subcategories exist for category", async () => {
            const categoryId = "category-without-subcategories";

            mockSubcategoryPrismaRepository.findSubcategoriesByCategory.mockResolvedValue([]);

            const result = await service.findByCategoryId(categoryId);

            expect(result).toEqual([]);
            expect(subcategoryPrismaRepository.findSubcategoriesByCategory).toHaveBeenCalledWith(
                categoryId,
            );
        });
    });

    describe("create", () => {
        it("should create and return a new subcategory", async () => {
            const createDto = {
                name: "New Subcategory",
                description: "New Description",
                id_category: "test-category-id",
            };

            const createdSubcategory = {
                id: "new-subcategory-id",
                name: createDto.name,
                description: createDto.description,
                category: { id: createDto.id_category, name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryPrismaRepository.createSubcategory.mockResolvedValue(createdSubcategory);

            const result = await service.create(createDto);

            expect(result).toEqual(createdSubcategory);
            expect(subcategoryPrismaRepository.createSubcategory).toHaveBeenCalledWith({
                name: createDto.name,
                description: createDto.description,
                category: {
                    connect: { id: createDto.id_category },
                },
            });
        });
    });

    describe("update", () => {
        it("should update and return a subcategory when it exists", async () => {
            const subcategoryId = "subcategory-to-update";
            const updateDto = {
                name: "Updated Name",
                description: "Updated Description",
            };

            const updatedSubcategory = {
                id: subcategoryId,
                name: "Updated Name",
                description: "Updated Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryPrismaRepository.updateSubcategory.mockResolvedValue(updatedSubcategory);

            const result = await service.update(subcategoryId, updateDto);

            expect(result).toEqual(updatedSubcategory);
            expect(subcategoryPrismaRepository.updateSubcategory).toHaveBeenCalledWith(
                subcategoryId,
                {
                    name: updateDto.name,
                    description: updateDto.description,
                },
            );
        });

        it("should update category connection when id_category is provided", async () => {
            const subcategoryId = "subcategory-to-update";
            const updateDto = {
                name: "Updated Name",
                id_category: "new-category-id",
            };

            const updatedSubcategory = {
                id: subcategoryId,
                name: "Updated Name",
                description: "Description",
                category: { id: "new-category-id", name: "New Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryPrismaRepository.updateSubcategory.mockResolvedValue(updatedSubcategory);

            const result = await service.update(subcategoryId, updateDto);

            expect(result).toEqual(updatedSubcategory);
            expect(subcategoryPrismaRepository.updateSubcategory).toHaveBeenCalledWith(
                subcategoryId,
                {
                    name: updateDto.name,
                    description: undefined,
                    category: { connect: { id: updateDto.id_category } },
                },
            );
        });
    });

    describe("remove", () => {
        it("should delete and return a subcategory when it exists", async () => {
            const subcategoryId = "subcategory-to-delete";
            const deletedSubcategory = {
                id: subcategoryId,
                name: "Subcategory",
                description: "Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryPrismaRepository.deleteSubcategory.mockResolvedValue(deletedSubcategory);

            const result = await service.remove(subcategoryId);

            expect(result).toEqual(deletedSubcategory);
            expect(subcategoryPrismaRepository.deleteSubcategory).toHaveBeenCalledWith(
                subcategoryId,
            );
        });

        it("should throw an exception when subcategory does not exist", async () => {
            const subcategoryId = "non-existent-subcategory";

            mockSubcategoryPrismaRepository.deleteSubcategory.mockRejectedValue(
                new Error("Record not found"),
            );

            await expect(service.remove(subcategoryId)).rejects.toThrow();
        });
    });
});
