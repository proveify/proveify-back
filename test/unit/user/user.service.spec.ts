import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "@app/user/user.service";
import { UserPrismaRepository } from "@app/user/repositories/user-prisma.repository";
import { UserFactory } from "@app/user/factories/user.factory";
import { ClsService } from "nestjs-cls";
import { UserNotFoundException } from "@app/user/exceptions/user-not-found.exception/user-not-found.exception";
import { UserEntity } from "@app/user/entities/user.entity";

const mockUserPrismaRepository = {
    createUser: jest.fn(),
    findUniqueUserByEmail: jest.fn(),
    findUniqueUserById: jest.fn(),
    updateUser: jest.fn(),
};

const mockUserFactory = {
    create: jest.fn(),
    createMany: jest.fn(),
};

const mockClsService = {
    get: jest.fn(),
    set: jest.fn(),
};

describe("UserService", () => {
    let service: UserService;
    let userPrismaRepository: UserPrismaRepository;
    let userFactory: UserFactory;
    let clsService: ClsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserPrismaRepository,
                    useValue: mockUserPrismaRepository,
                },
                {
                    provide: UserFactory,
                    useValue: mockUserFactory,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userPrismaRepository = module.get<UserPrismaRepository>(UserPrismaRepository);
        userFactory = module.get<UserFactory>(UserFactory);
        clsService = module.get<ClsService>(ClsService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getUserProfile", () => {
        it("should return user profile from database when fromCls is false", async () => {
            const mockUser = {
                id: "test-user-id",
                name: "Test User",
                email: "test@example.com",
                identification: "12345",
                identification_type: "CC",
                password: "hashed_password",
                refreshed_token: "token123",
                user_type: "CLIENT",
                provider: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const mockUserEntity = new UserEntity(mockUser);

            mockUserPrismaRepository.findUniqueUserById.mockResolvedValue(mockUser);
            mockUserFactory.create.mockReturnValue(mockUserEntity);

            const result = await service.getUserProfile("test-user-id", false);

            expect(result).toEqual(mockUserEntity);
            expect(userPrismaRepository.findUniqueUserById).toHaveBeenCalledWith({
                where: { id: "test-user-id" },
                include: { provider: true },
            });
            expect(userFactory.create).toHaveBeenCalledWith(mockUser);
        });

        it("should return user profile from ClsService when fromCls is true", async () => {
            const mockUserEntity = new UserEntity({
                id: "test-user-id",
                name: "Test User",
                email: "test@example.com",
                identification: "12345",
                identification_type: "CC",
                password: "hashed_password",
                refreshed_token: "token123",
                user_type: "CLIENT",
                provider: null,
                created_at: new Date(),
                updated_at: new Date(),
            });

            mockClsService.get.mockReturnValue(mockUserEntity);

            const result = await service.getUserProfile("test-user-id", true);

            expect(result).toEqual(mockUserEntity);
            expect(clsService.get).toHaveBeenCalledWith("user");
            expect(userPrismaRepository.findUniqueUserById).not.toHaveBeenCalled();
        });

        it("should throw exception when user does not exist", async () => {
            mockUserPrismaRepository.findUniqueUserById.mockResolvedValue(null);

            await expect(service.getUserProfile("non-existent-id", false)).rejects.toThrow(
                new UserNotFoundException("non-existent-id"),
            );
        });
    });

    describe("saveUser", () => {
        it("should create and return a new user", async () => {
            const userData = {
                name: "New User",
                email: "new@example.com",
                password: "hashed_password",
                identification: "54321",
                identification_type: "CC",
                user_type: "CLIENT",
            };

            const createdUser = {
                id: "new-user-id",
                ...userData,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const userEntity = new UserEntity(createdUser);

            mockUserPrismaRepository.createUser.mockResolvedValue(createdUser);
            mockUserFactory.create.mockReturnValue(userEntity);

            const result = await service.saveUser(userData as any);

            expect(result).toEqual(userEntity);
            expect(userPrismaRepository.createUser).toHaveBeenCalledWith(userData);
            expect(userFactory.create).toHaveBeenCalledWith(createdUser);
        });
    });

    describe("findUserOneByEmail", () => {
        it("should return user when found by email", async () => {
            const email = "test@example.com";
            const mockUser = {
                id: "user-123",
                email,
                name: "Test User",
                password: "hashed",
                identification: "12345",
                identification_type: "CC",
                user_type: "CLIENT",
                created_at: new Date(),
                updated_at: new Date(),
            };

            const userEntity = new UserEntity(mockUser);

            mockUserPrismaRepository.findUniqueUserByEmail.mockResolvedValue(mockUser);
            mockUserFactory.create.mockReturnValue(userEntity);

            const result = await service.findUserOneByEmail(email);

            expect(result).toEqual(userEntity);
            expect(userPrismaRepository.findUniqueUserByEmail).toHaveBeenCalledWith(email);
            expect(userFactory.create).toHaveBeenCalledWith(mockUser);
        });

        it("should return null when user not found", async () => {
            mockUserPrismaRepository.findUniqueUserByEmail.mockResolvedValue(null);

            const result = await service.findUserOneByEmail("nonexistent@example.com");

            expect(result).toBeNull();
            expect(userFactory.create).not.toHaveBeenCalled();
        });
    });

    describe("findUserOneById", () => {
        it("should return user when found by id", async () => {
            const userId = "user-123";
            const mockUser = {
                id: userId,
                email: "test@example.com",
                name: "Test User",
                password: "hashed",
                identification: "12345",
                identification_type: "CC",
                user_type: "CLIENT",
                created_at: new Date(),
                updated_at: new Date(),
            };

            const userEntity = new UserEntity(mockUser);

            mockUserPrismaRepository.findUniqueUserById.mockResolvedValue(mockUser);
            mockUserFactory.create.mockReturnValue(userEntity);

            const result = await service.findUserOneById({ id: userId });

            expect(result).toEqual(userEntity);
            expect(userPrismaRepository.findUniqueUserById).toHaveBeenCalledWith({ id: userId });
            expect(userFactory.create).toHaveBeenCalledWith(mockUser);
        });

        it("should return null when user not found", async () => {
            mockUserPrismaRepository.findUniqueUserById.mockResolvedValue(null);

            const result = await service.findUserOneById({ id: "non-existent" });

            expect(result).toBeNull();
            expect(userFactory.create).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("should update and return user", async () => {
            const userId = "user-123";
            const updateData = {
                name: "Updated Name",
            };

            const updatedUser = {
                id: userId,
                name: "Updated Name",
                email: "test@example.com",
                password: "hashed",
                identification: "12345",
                identification_type: "CC",
                user_type: "CLIENT",
                created_at: new Date(),
                updated_at: new Date(),
            };

            const userEntity = new UserEntity(updatedUser);

            mockUserPrismaRepository.updateUser.mockResolvedValue(updatedUser);
            mockUserFactory.create.mockReturnValue(userEntity);

            const result = await service.update(userId, updateData);

            expect(result).toEqual(userEntity);
            expect(userPrismaRepository.updateUser).toHaveBeenCalledWith(userId, updateData);
            expect(userFactory.create).toHaveBeenCalledWith(updatedUser);
        });
    });
});
