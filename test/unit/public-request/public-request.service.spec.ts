import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { PublicRequestService } from "@app/public-request/public-request.service";
import { PublicRequestPrismaRepository } from "@app/public-request/repositories/public-request-prisma.repository";
import { PublicRequestFactory } from "@app/public-request/factories/public-request.factory";
import { ProviderQuoteService } from "@app/provider-quote/provider-quote.service";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";

const mockPublicRequestPrismaRepository = {
    createPublicRequest: jest.fn(),
    findManyPublicRequests: jest.fn(),
    findUniquePublicRequest: jest.fn(),
    findPublicRequestByIdOnly: jest.fn(),
    updatePublicRequest: jest.fn(),
    deletePublicRequest: jest.fn(),
};

const mockPublicRequestFactory = {
    create: jest.fn(),
    createMany: jest.fn(),
};

const mockProviderQuoteService = {
    findAll: jest.fn(),
};

const mockClsService = {
    get: jest.fn(),
    set: jest.fn(),
};

describe("PublicRequestService", () => {
    let service: PublicRequestService;
    let publicRequestPrismaRepository: PublicRequestPrismaRepository;
    let publicRequestFactory: PublicRequestFactory;
    let providerQuoteService: ProviderQuoteService;
    let clsService: ClsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PublicRequestService,
                {
                    provide: PublicRequestPrismaRepository,
                    useValue: mockPublicRequestPrismaRepository,
                },
                {
                    provide: PublicRequestFactory,
                    useValue: mockPublicRequestFactory,
                },
                {
                    provide: ProviderQuoteService,
                    useValue: mockProviderQuoteService,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
                },
            ],
        }).compile();

        service = module.get<PublicRequestService>(PublicRequestService);
        publicRequestPrismaRepository = module.get<PublicRequestPrismaRepository>(
            PublicRequestPrismaRepository,
        );
        publicRequestFactory = module.get<PublicRequestFactory>(PublicRequestFactory);
        providerQuoteService = module.get<ProviderQuoteService>(ProviderQuoteService);
        clsService = module.get<ClsService>(ClsService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a public request successfully", async () => {
            const mockUser = new UserEntity({ id: "user-1", name: "Test User" } as any);
            const createDto = {
                title: "Test Request",
                description: "Test description",
            };
            const createdRequest = {
                id: "request-1",
                ...createDto,
                user_id: mockUser.id,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.createPublicRequest.mockResolvedValue(createdRequest);
            mockPublicRequestFactory.create.mockReturnValue(createdRequest);

            const result = await service.create(createDto);

            expect(result).toEqual(createdRequest);
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(publicRequestPrismaRepository.createPublicRequest).toHaveBeenCalledWith({
                title: createDto.title,
                description: createDto.description,
                user: { connect: { id: mockUser.id } },
            });
            expect(publicRequestFactory.create).toHaveBeenCalledWith(createdRequest);
        });
    });

    describe("findAll", () => {
        it("should return all public requests without filters", async () => {
            const mockRequests = [
                { id: "request-1", title: "Request 1", created_at: new Date() },
                { id: "request-2", title: "Request 2", created_at: new Date() },
            ];

            mockPublicRequestPrismaRepository.findManyPublicRequests.mockResolvedValue(
                mockRequests,
            );
            mockPublicRequestFactory.createMany.mockReturnValue(mockRequests);

            const result = await service.findAll();

            expect(result).toEqual(mockRequests);
            expect(publicRequestPrismaRepository.findManyPublicRequests).toHaveBeenCalledWith(
                {},
                30,
                undefined,
                { created_at: "desc" },
            );
            expect(publicRequestFactory.createMany).toHaveBeenCalledWith(mockRequests);
        });

        it("should return filtered public requests by user_id", async () => {
            const userId = "user-1";
            const params = { user_id: userId };
            const mockRequests = [{ id: "request-1", title: "Request 1", user_id: userId }];

            mockPublicRequestPrismaRepository.findManyPublicRequests.mockResolvedValue(
                mockRequests,
            );
            mockPublicRequestFactory.createMany.mockReturnValue(mockRequests);

            const result = await service.findAll(params);

            expect(result).toEqual(mockRequests);
            expect(publicRequestPrismaRepository.findManyPublicRequests).toHaveBeenCalledWith(
                { user_id: userId },
                30,
                undefined,
                { created_at: "desc" },
            );
            expect(publicRequestFactory.createMany).toHaveBeenCalledWith(mockRequests);
        });

        it("should return filtered public requests by search term", async () => {
            const params = { search: "design" };
            const mockRequests = [
                { id: "request-1", title: "Design Request", description: "Need design services" },
            ];

            mockPublicRequestPrismaRepository.findManyPublicRequests.mockResolvedValue(
                mockRequests,
            );
            mockPublicRequestFactory.createMany.mockReturnValue(mockRequests);

            const result = await service.findAll(params);

            expect(result).toEqual(mockRequests);
            expect(publicRequestPrismaRepository.findManyPublicRequests).toHaveBeenCalledWith(
                {
                    OR: [
                        { title: { contains: "design" } },
                        { description: { contains: "design" } },
                    ],
                },
                30,
                undefined,
                { created_at: "desc" },
            );
            expect(publicRequestFactory.createMany).toHaveBeenCalledWith(mockRequests);
        });
    });

    describe("findOne", () => {
        it("should return a public request by id", async () => {
            const requestId = "request-1";
            const mockRequest = {
                id: requestId,
                title: "Test Request",
                description: "Test description",
            };

            mockPublicRequestPrismaRepository.findUniquePublicRequest.mockResolvedValue(
                mockRequest,
            );
            mockPublicRequestFactory.create.mockReturnValue(mockRequest);

            const result = await service.findOne(requestId);

            expect(result).toEqual(mockRequest);
            expect(publicRequestPrismaRepository.findUniquePublicRequest).toHaveBeenCalledWith(
                requestId,
            );
            expect(publicRequestFactory.create).toHaveBeenCalledWith(mockRequest);
        });

        it("should return null when request not found", async () => {
            const requestId = "non-existent";

            mockPublicRequestPrismaRepository.findUniquePublicRequest.mockResolvedValue(null);

            const result = await service.findOne(requestId);

            expect(result).toBeNull();
            expect(publicRequestFactory.create).not.toHaveBeenCalled();
        });
    });

    describe("findMyRequests", () => {
        it("should return user's own requests", async () => {
            const mockUser = new UserEntity({ id: "user-1" } as any);
            const mockRequests = [{ id: "request-1", title: "My Request", user_id: mockUser.id }];

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.findManyPublicRequests.mockResolvedValue(
                mockRequests,
            );
            mockPublicRequestFactory.createMany.mockReturnValue(mockRequests);

            const result = await service.findMyRequests();

            expect(result).toEqual(mockRequests);
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(publicRequestPrismaRepository.findManyPublicRequests).toHaveBeenCalledWith(
                { user_id: mockUser.id },
                30,
                undefined,
                { created_at: "desc" },
            );
            expect(publicRequestFactory.createMany).toHaveBeenCalledWith(mockRequests);
        });
    });

    describe("update", () => {
        it("should update request when user is owner", async () => {
            const mockUser = new UserEntity({ id: "user-1" } as any);
            const requestId = "request-1";
            const updateDto = { title: "Updated Title" };
            const existingRequest = { id: requestId, user_id: mockUser.id };
            const updatedRequest = { ...existingRequest, ...updateDto };

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.findPublicRequestByIdOnly.mockResolvedValue(
                existingRequest,
            );
            mockPublicRequestPrismaRepository.updatePublicRequest.mockResolvedValue(updatedRequest);
            mockPublicRequestFactory.create.mockReturnValue(updatedRequest);

            const result = await service.update(requestId, updateDto);

            expect(result).toEqual(updatedRequest);
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(publicRequestPrismaRepository.updatePublicRequest).toHaveBeenCalledWith(
                requestId,
                updateDto,
            );
            expect(publicRequestFactory.create).toHaveBeenCalledWith(updatedRequest);
        });

        it("should throw NOT_FOUND when request does not exist", async () => {
            const mockUser = new UserEntity({ id: "user-1" } as any);
            const requestId = "non-existent";
            const updateDto = { title: "Updated Title" };

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.findPublicRequestByIdOnly.mockResolvedValue(null);

            await expect(service.update(requestId, updateDto)).rejects.toThrow(
                new HttpException("Public request not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw FORBIDDEN when user is not owner", async () => {
            const mockUser = new UserEntity({ id: "user-1" } as any);
            const requestId = "request-1";
            const updateDto = { title: "Updated Title" };
            const existingRequest = { id: requestId, user_id: "different-user" };

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.findPublicRequestByIdOnly.mockResolvedValue(
                existingRequest,
            );

            await expect(service.update(requestId, updateDto)).rejects.toThrow(
                new HttpException(
                    "You can only update your own public requests",
                    HttpStatus.FORBIDDEN,
                ),
            );
        });
    });

    describe("remove", () => {
        it("should delete request when user is owner", async () => {
            const mockUser = new UserEntity({ id: "user-1" } as any);
            const requestId = "request-1";
            const existingRequest = { id: requestId, user_id: mockUser.id };

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.findPublicRequestByIdOnly.mockResolvedValue(
                existingRequest,
            );
            mockPublicRequestPrismaRepository.deletePublicRequest.mockResolvedValue(
                existingRequest,
            );
            mockPublicRequestFactory.create.mockReturnValue(existingRequest);

            const result = await service.remove(requestId);

            expect(result).toEqual(existingRequest);
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(publicRequestPrismaRepository.deletePublicRequest).toHaveBeenCalledWith(
                requestId,
            );
            expect(publicRequestFactory.create).toHaveBeenCalledWith(existingRequest);
        });

        it("should throw NOT_FOUND when request does not exist", async () => {
            const mockUser = new UserEntity({ id: "user-1" } as any);
            const requestId = "non-existent";

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.findPublicRequestByIdOnly.mockResolvedValue(null);

            await expect(service.remove(requestId)).rejects.toThrow(
                new HttpException("Public request not found", HttpStatus.NOT_FOUND),
            );
        });

        it("should throw FORBIDDEN when user is not owner", async () => {
            const mockUser = new UserEntity({ id: "user-1" } as any);
            const requestId = "request-1";
            const existingRequest = { id: requestId, user_id: "different-user" };

            mockClsService.get.mockReturnValue(mockUser);
            mockPublicRequestPrismaRepository.findPublicRequestByIdOnly.mockResolvedValue(
                existingRequest,
            );

            await expect(service.remove(requestId)).rejects.toThrow(
                new HttpException(
                    "You can only delete your own public requests",
                    HttpStatus.FORBIDDEN,
                ),
            );
        });
    });
});
