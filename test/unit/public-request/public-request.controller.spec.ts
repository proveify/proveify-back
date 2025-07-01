import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus, ClassSerializerInterceptor } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { Reflector } from "@nestjs/core";
import { PublicRequestController } from "../../../src/public-request/public-request.controller";
import { PublicRequestService } from "../../../src/public-request/public-request.service";
import { PublicRequestEntity } from "../../../src/public-request/entities/public-request.entity";
import { plainToInstance } from "class-transformer";

const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

const mockPublicRequestService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findMyRequests: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe("PublicRequestController", () => {
    let controller: PublicRequestController;
    let publicRequestService: PublicRequestService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PublicRequestController],
            providers: [
                {
                    provide: PublicRequestService,
                    useValue: mockPublicRequestService,
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
            .compile();

        controller = module.get<PublicRequestController>(PublicRequestController);
        publicRequestService = module.get<PublicRequestService>(PublicRequestService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should create a public request successfully", async () => {
            const createDto = {
                title: "Test Request",
                description: "Test description",
            };
            const createdRequest = {
                id: "request-1",
                ...createDto,
                user_id: "test-user-id",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPublicRequestService.create.mockResolvedValue(createdRequest);

            const result = await controller.create(createDto);
            const serialized = plainToInstance(PublicRequestEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("request-1");
            expect(serialized.title).toBe(createDto.title);
            expect(publicRequestService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe("findAll", () => {
        it("should return an array of public requests", async () => {
            const mockRequests = [
                {
                    id: "request-1",
                    title: "Request 1",
                    description: "Description 1",
                    user_id: "user-1",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: "request-2",
                    title: "Request 2",
                    description: "Description 2",
                    user_id: "user-2",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockPublicRequestService.findAll.mockResolvedValue(mockRequests);

            const result = await controller.findAll({});

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("request-1");
            expect(result[1].id).toBe("request-2");
            expect(publicRequestService.findAll).toHaveBeenCalledWith({});
        });
    });

    describe("findOne", () => {
        it("should return a public request when it exists", async () => {
            const mockRequest = {
                id: "test-request-id",
                title: "Test Request",
                description: "Test Description",
                user_id: "user-1",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPublicRequestService.findOne.mockResolvedValue(mockRequest);

            const result = await controller.findOne("test-request-id");
            const serialized = plainToInstance(PublicRequestEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-request-id");
            expect(publicRequestService.findOne).toHaveBeenCalledWith("test-request-id");
        });

        it("should throw exception when request does not exist", async () => {
            mockPublicRequestService.findOne.mockResolvedValue(null);

            await expect(controller.findOne("non-existent-id")).rejects.toThrow(
                new HttpException("Public request not found", HttpStatus.NOT_FOUND),
            );
        });
    });

    describe("findMyRequests", () => {
        it("should return user's own requests", async () => {
            const mockRequests = [
                {
                    id: "request-1",
                    title: "My Request",
                    description: "My Description",
                    user_id: "test-user-id",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockPublicRequestService.findMyRequests.mockResolvedValue(mockRequests);

            const result = await controller.findMyRequests({});

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("request-1");
            expect(publicRequestService.findMyRequests).toHaveBeenCalledWith({});
        });
    });

    describe("update", () => {
        it("should update and return a request when user is owner", async () => {
            const updateDto = {
                title: "Updated Request",
                description: "Updated Description",
            };
            const updatedRequest = {
                id: "test-request-id",
                ...updateDto,
                user_id: "test-user-id",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPublicRequestService.update.mockResolvedValue(updatedRequest);

            const result = await controller.update("test-request-id", updateDto);
            const serialized = plainToInstance(PublicRequestEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-request-id");
            expect(serialized.title).toBe(updateDto.title);
            expect(publicRequestService.update).toHaveBeenCalledWith("test-request-id", updateDto);
        });

        it("should throw exception when user is not owner", async () => {
            const updateDto = { title: "Updated" };

            mockPublicRequestService.update.mockRejectedValue(
                new HttpException(
                    "You can only update your own public requests",
                    HttpStatus.FORBIDDEN,
                ),
            );

            await expect(controller.update("test-request-id", updateDto)).rejects.toThrow(
                HttpException,
            );
        });
    });

    describe("remove", () => {
        it("should delete and return success message when user is owner", async () => {
            const deletedRequest = {
                id: "request-to-delete",
                title: "Request",
                description: "Description",
                user_id: "test-user-id",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPublicRequestService.remove.mockResolvedValue(deletedRequest);

            const result = await controller.remove("request-to-delete");

            expect(result).toEqual({
                code: 200,
                message: "Public request deleted successfully",
            });
            expect(publicRequestService.remove).toHaveBeenCalledWith("request-to-delete");
        });

        it("should throw exception when user is not owner", async () => {
            mockPublicRequestService.remove.mockRejectedValue(
                new HttpException(
                    "You can only delete your own public requests",
                    HttpStatus.FORBIDDEN,
                ),
            );

            await expect(controller.remove("test-request-id")).rejects.toThrow(HttpException);
        });
    });
});