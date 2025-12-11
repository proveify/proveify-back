import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../../src/auth/auth.controller";
import { AuthService } from "../../../src/auth/auth.service";
import { HttpStatus, ClassSerializerInterceptor } from "@nestjs/common";
import { LocalAuthGuard } from "../../../src/auth/guards/local.guard";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { RefreshJwtAuthGuard } from "../../../src/auth/guards/refresh-jwt.guard";
import { TransactionInterceptor } from "../../../src/prisma/interceptors/transaction.interceptor";
import { Reflector } from "@nestjs/core";
import { UserAuthenticateEntity } from "../../../src/auth/entities/user-authenticate.entity";
import { NestjsFormDataModule } from "nestjs-form-data";

const mockAuthService = {
    createClient: jest.fn(),
    createProvider: jest.fn(),
    singIn: jest.fn(),
    refreshToken: jest.fn(),
    singOut: jest.fn(),
};

const mockLocalAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id", email: "test@example.com" };
        return true;
    }),
};

const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

const mockRefreshJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

describe("AuthController", () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [NestjsFormDataModule.config({ isGlobal: true })],
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(LocalAuthGuard)
            .useValue(mockLocalAuthGuard)
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideGuard(RefreshJwtAuthGuard)
            .useValue(mockRefreshJwtAuthGuard)
            .overrideInterceptor(ClassSerializerInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .overrideInterceptor(TransactionInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("register", () => {
        it("should register a client successfully", async () => {
            const clientData = {
                name: "Test Client",
                email: "client@example.com",
                password: "password123",
                identification: "123456",
                identification_type: "CC",
                phone: "1234567890",
            };

            const createdUser = {
                id: "client-123",
                ...clientData,
                user_type: "CLIENT",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockAuthService.createClient.mockResolvedValue(createdUser);

            const result = await controller.register(clientData as any);

            expect(authService.createClient).toHaveBeenCalledWith(clientData);
            expect(result).toEqual({
                code: HttpStatus.CREATED,
                message: "Register successfully",
            });
        });
    });

    describe("registerProvider", () => {
        it("should register a provider successfully", async () => {
            const providerData = {
                name: "Test Provider",
                email: "provider@example.com",
                password: "password123",
                identification: "987654",
                identification_type: "NIT",
                phone: "9876543210",
                rut: {} as any,
                chamber_commerce: {} as any,
            };

            const createdProvider = {
                id: "provider-123",
                name: providerData.name,
                email: providerData.email,
                identification: providerData.identification,
                identification_type: providerData.identification_type,
            };

            mockAuthService.createProvider.mockResolvedValue(createdProvider);

            const result = await controller.registerProvider(providerData as any);

            expect(authService.createProvider).toHaveBeenCalledWith(providerData);
            expect(result).toEqual({
                code: HttpStatus.CREATED,
                message: "Register successfully",
            });
        });
    });

    describe("login", () => {
        it("should login user and return authentication data", async () => {
            const mockRequest = {
                user: { id: "user-123", email: "test@example.com" },
            };

            const authData = {
                id: "user-123",
                accessToken: "access-token-123",
                refreshToken: "refresh-token-123",
            };

            mockAuthService.singIn.mockResolvedValue(authData);

            const result = await controller.login(mockRequest as any);

            expect(authService.singIn).toHaveBeenCalledWith("user-123");
            expect(result).toBeInstanceOf(UserAuthenticateEntity);
            expect(result.id).toBe(authData.id);
            expect(result.accessToken).toBe(authData.accessToken);
            expect(result.refreshToken).toBe(authData.refreshToken);
        });
    });

    describe("refresh", () => {
        it("should refresh tokens successfully", async () => {
            const mockRequest = {
                user: { id: "user-123" },
            };

            const authData = {
                id: "user-123",
                accessToken: "new-access-token",
                refreshToken: "new-refresh-token",
            };

            mockAuthService.refreshToken.mockResolvedValue(authData);

            const result = await controller.refresh(mockRequest as any);

            expect(authService.refreshToken).toHaveBeenCalledWith("user-123");
            expect(result).toBeInstanceOf(UserAuthenticateEntity);
            expect(result.id).toBe(authData.id);
            expect(result.accessToken).toBe(authData.accessToken);
            expect(result.refreshToken).toBe(authData.refreshToken);
        });
    });

    describe("logout", () => {
        it("should logout user successfully", async () => {
            const mockRequest = {
                user: { id: "user-123" },
            };

            mockAuthService.singOut.mockResolvedValue(undefined);

            const result = await controller.logout(mockRequest as any);

            expect(authService.singOut).toHaveBeenCalledWith("user-123");
            expect(result).toEqual({
                code: 200,
                message: "Logged out successfully",
            });
        });
    });
});
