import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../../src/auth/auth.service";
import { UserService } from "../../../src/user/user.service";
import { PlanService } from "../../../src/plan/plan.service";
import { ProviderService } from "../../../src/provider/provider.service";
import { FileService } from "../../../src/file/file.service";
import { JwtService } from "@nestjs/jwt";
import { ClsService } from "nestjs-cls";
import { HttpException, UnauthorizedException } from "@nestjs/common";
import refreshJwtConfig from "../../../src/common/refresh-jwt-config";
import { UserTypes } from "../../../src/user/interfaces/users";
import { PlanTypes } from "../../../src/plan/interfaces/plan.interface";
import * as argon2 from "argon2";

jest.mock("argon2");

const mockUserService = {
    saveUser: jest.fn(),
    findUserOneByEmail: jest.fn(),
    findUserOneById: jest.fn(),
    update: jest.fn(),
};

const mockClsService = {
    set: jest.fn(),
    get: jest.fn(),
};

const mockPlanService = {
    getPlanByKey: jest.fn(),
};

const mockProviderService = {
    saveProvider: jest.fn(),
};

const mockFileService = {
    save: jest.fn(),
};

const mockJwtService = {
    signAsync: jest.fn(),
};

const mockRefreshJwtConfig = {
    secret: "test-refresh-secret",
    expiresIn: "7d",
};

describe("AuthService", () => {
    let service: AuthService;
    let userService: UserService;
    let clsService: ClsService;
    let planService: PlanService;
    let providerService: ProviderService;
    let fileService: FileService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: ClsService,
                    useValue: mockClsService,
                },
                {
                    provide: PlanService,
                    useValue: mockPlanService,
                },
                {
                    provide: ProviderService,
                    useValue: mockProviderService,
                },
                {
                    provide: FileService,
                    useValue: mockFileService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: refreshJwtConfig.KEY,
                    useValue: mockRefreshJwtConfig,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        clsService = module.get<ClsService>(ClsService);
        planService = module.get<PlanService>(PlanService);
        providerService = module.get<ProviderService>(ProviderService);
        fileService = module.get<FileService>(FileService);
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createUser", () => {
        it("should create a user with hashed password", async () => {
            const userData = {
                name: "Test User",
                email: "test@example.com",
                password: "plainPassword",
                identification: "12345",
                identification_type: "CC",
                user_type: UserTypes.CLIENT,
            };

            const hashedPassword = "hashedPassword123";
            const createdUser = {
                id: "user-123",
                ...userData,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date(),
            };

            (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockUserService.saveUser.mockResolvedValue(createdUser);

            const result = await service.createUser(userData);

            expect(argon2.hash).toHaveBeenCalledWith("plainPassword");
            expect(userService.saveUser).toHaveBeenCalledWith({
                ...userData,
                password: hashedPassword,
            });
            expect(clsService.set).toHaveBeenCalledWith("user", createdUser);
            expect(result).toEqual(createdUser);
        });
    });

    describe("createClient", () => {
        it("should create a client user successfully", async () => {
            const clientData = {
                name: "Client User",
                email: "client@example.com",
                password: "password123",
                identification: "123456",
                identification_type: "CC",
                phone: "1234567890",
            };

            const createdUser = {
                id: "client-123",
                ...clientData,
                user_type: UserTypes.CLIENT,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockUserService.findUserOneByEmail.mockResolvedValue(null);
            jest.spyOn(service, "createUser").mockResolvedValue(createdUser as any);

            const result = await service.createClient(clientData);

            expect(userService.findUserOneByEmail).toHaveBeenCalledWith(clientData.email);
            expect(service.createUser).toHaveBeenCalledWith({
                ...clientData,
                user_type: UserTypes.CLIENT,
            });
            expect(result).toEqual(createdUser);
        });

        it("should throw an error if email already exists", async () => {
            const clientData = {
                name: "Client User",
                email: "existing@example.com",
                password: "password123",
                identification: "123456",
                identification_type: "CC",
            };

            const existingUser = {
                id: "existing-user-123",
                email: "existing@example.com",
            };

            mockUserService.findUserOneByEmail.mockResolvedValue(existingUser);

            await expect(service.createClient(clientData)).rejects.toThrow(
                new HttpException("Email already used", 400),
            );
            expect(userService.findUserOneByEmail).toHaveBeenCalledWith(clientData.email);
        });
    });

    describe("createProvider", () => {
        it("should create a provider with user and files", async () => {
            const providerData = {
                name: "Provider Name",
                email: "provider@example.com",
                password: "password123",
                identification: "987654",
                identification_type: "NIT",
                phone: "9876543210",
                rut: {} as any,
                chamber_commerce: {} as any,
            };

            const createdUser = {
                id: "user-123",
                name: providerData.name,
                email: providerData.email,
                identification: providerData.identification,
                identification_type: providerData.identification_type,
                user_type: UserTypes.PROVIDER,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const plan = {
                id: "plan-123",
                plan_key: PlanTypes.NONE,
                name: "None Plan",
            };

            const rutFile = { id: "rut-file-123" };
            const chamberFile = { id: "chamber-file-123" };

            const createdProvider = {
                id: "provider-123",
                name: createdUser.name,
                email: createdUser.email,
                identification: createdUser.identification,
                identification_type: createdUser.identification_type,
                rut: rutFile.id,
                chamber_commerce: chamberFile.id,
            };

            jest.spyOn(service, "createUser").mockResolvedValue(createdUser as any);
            mockPlanService.getPlanByKey.mockResolvedValue(plan);
            mockFileService.save.mockResolvedValueOnce(rutFile).mockResolvedValueOnce(chamberFile);
            mockProviderService.saveProvider.mockResolvedValue(createdProvider);

            const result = await service.createProvider(providerData);

            expect(service.createUser).toHaveBeenCalled();
            expect(planService.getPlanByKey).toHaveBeenCalledWith(PlanTypes.NONE);
            expect(fileService.save).toHaveBeenCalledTimes(2);
            expect(providerService.saveProvider).toHaveBeenCalled();
            expect(result).toEqual(createdProvider);
        });
    });

    describe("singIn", () => {
        it("should sign in user and return tokens", async () => {
            const userId = "user-123";
            const accessToken = "access-token-123";
            const refreshToken = "refresh-token-123";

            mockJwtService.signAsync
                .mockResolvedValueOnce(accessToken)
                .mockResolvedValueOnce(refreshToken);

            jest.spyOn(service, "saveRefreshedToken").mockResolvedValue(undefined);

            const result = await service.singIn(userId);

            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(service.saveRefreshedToken).toHaveBeenCalledWith(userId, refreshToken);
            expect(result).toEqual({
                id: userId,
                accessToken,
                refreshToken,
            });
        });
    });

    describe("validateUser", () => {
        it("should return user when credentials are valid", async () => {
            const email = "test@example.com";
            const password = "password123";
            const hashedPassword = "hashedPassword123";

            const user = {
                id: "user-123",
                email,
                password: hashedPassword,
                name: "Test User",
            };

            mockUserService.findUserOneByEmail.mockResolvedValue(user);
            (argon2.verify as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser(email, password);

            expect(userService.findUserOneByEmail).toHaveBeenCalledWith(email);
            expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, password);
            expect(result).toEqual(user);
        });

        it("should return false when user does not exist", async () => {
            const email = "nonexistent@example.com";
            const password = "password123";

            mockUserService.findUserOneByEmail.mockResolvedValue(null);

            const result = await service.validateUser(email, password);

            expect(userService.findUserOneByEmail).toHaveBeenCalledWith(email);
            expect(result).toBe(false);
        });

        it("should return false when password is invalid", async () => {
            const email = "test@example.com";
            const password = "wrongPassword";
            const hashedPassword = "hashedPassword123";

            const user = {
                id: "user-123",
                email,
                password: hashedPassword,
            };

            mockUserService.findUserOneByEmail.mockResolvedValue(user);
            (argon2.verify as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser(email, password);

            expect(userService.findUserOneByEmail).toHaveBeenCalledWith(email);
            expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, password);
            expect(result).toBe(false);
        });
    });

    describe("generatePasswordHash", () => {
        it("should hash password using argon2", async () => {
            const password = "plainPassword";
            const hashedPassword = "hashedPassword123";

            (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const result = await service.generatePasswordHash(password);

            expect(argon2.hash).toHaveBeenCalledWith(password);
            expect(result).toBe(hashedPassword);
        });
    });

    describe("validatePassword", () => {
        it("should validate password correctly", async () => {
            const password = "plainPassword";
            const hash = "hashedPassword123";

            (argon2.verify as jest.Mock).mockResolvedValue(true);

            const result = await service.validatePassword(password, hash);

            expect(argon2.verify).toHaveBeenCalledWith(hash, password);
            expect(result).toBe(true);
        });
    });

    describe("generateTokens", () => {
        it("should generate access and refresh tokens", async () => {
            const payload = { id: "user-123" };
            const accessToken = "access-token-123";
            const refreshToken = "refresh-token-123";

            mockJwtService.signAsync
                .mockResolvedValueOnce(accessToken)
                .mockResolvedValueOnce(refreshToken);

            const result = await service.generateTokens(payload);

            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(jwtService.signAsync).toHaveBeenCalledWith(payload);
            expect(jwtService.signAsync).toHaveBeenCalledWith(payload, mockRefreshJwtConfig);
            expect(result).toEqual({ accessToken, refreshToken });
        });
    });

    describe("refreshToken", () => {
        it("should refresh tokens for a user", async () => {
            const userId = "user-123";
            const accessToken = "new-access-token";
            const refreshToken = "new-refresh-token";

            jest.spyOn(service, "generateTokens").mockResolvedValue({
                accessToken,
                refreshToken,
            });
            jest.spyOn(service, "saveRefreshedToken").mockResolvedValue(undefined);

            const result = await service.refreshToken(userId);

            expect(service.generateTokens).toHaveBeenCalledWith({ id: userId });
            expect(service.saveRefreshedToken).toHaveBeenCalledWith(userId, refreshToken);
            expect(result).toEqual({
                id: userId,
                accessToken,
                refreshToken,
            });
        });
    });

    describe("validateRefreshJwt", () => {
        it("should validate refresh token successfully", async () => {
            const userId = "user-123";
            const refreshToken = "refresh-token-123";
            const hashedToken = "hashed-refresh-token";

            const user = {
                id: userId,
                refreshed_token: hashedToken,
            };

            mockUserService.findUserOneById.mockResolvedValue(user);
            (argon2.verify as jest.Mock).mockResolvedValue(true);

            const result = await service.validateRefreshJwt(userId, refreshToken);

            expect(userService.findUserOneById).toHaveBeenCalledWith({ id: userId });
            expect(argon2.verify).toHaveBeenCalledWith(hashedToken, refreshToken);
            expect(result).toBe(userId);
        });

        it("should throw UnauthorizedException when user has no refresh token", async () => {
            const userId = "user-123";
            const refreshToken = "refresh-token-123";

            const user = {
                id: userId,
                refreshed_token: null,
            };

            mockUserService.findUserOneById.mockResolvedValue(user);

            await expect(service.validateRefreshJwt(userId, refreshToken)).rejects.toThrow(
                new UnauthorizedException("Invalid refresh token"),
            );
        });

        it("should throw UnauthorizedException when refresh token is invalid", async () => {
            const userId = "user-123";
            const refreshToken = "invalid-token";
            const hashedToken = "hashed-refresh-token";

            const user = {
                id: userId,
                refreshed_token: hashedToken,
            };

            mockUserService.findUserOneById.mockResolvedValue(user);
            (argon2.verify as jest.Mock).mockResolvedValue(false);

            await expect(service.validateRefreshJwt(userId, refreshToken)).rejects.toThrow(
                new UnauthorizedException("Invalid refresh token"),
            );
        });
    });

    describe("saveRefreshedToken", () => {
        it("should save hashed refresh token", async () => {
            const userId = "user-123";
            const refreshToken = "refresh-token-123";
            const hashedToken = "hashed-refresh-token";

            (argon2.hash as jest.Mock).mockResolvedValue(hashedToken);
            mockUserService.update.mockResolvedValue(undefined);

            await service.saveRefreshedToken(userId, refreshToken);

            expect(argon2.hash).toHaveBeenCalledWith(refreshToken);
            expect(userService.update).toHaveBeenCalledWith(userId, {
                refreshed_token: hashedToken,
            });
        });
    });

    describe("singOut", () => {
        it("should clear refresh token on logout", async () => {
            const userId = "user-123";

            mockUserService.update.mockResolvedValue(undefined);

            await service.singOut(userId);

            expect(userService.update).toHaveBeenCalledWith(userId, {
                refreshed_token: null,
            });
        });
    });
});
