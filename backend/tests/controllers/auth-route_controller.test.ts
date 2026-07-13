import {
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";
import request from "supertest";
import { AppError, ERRORS } from "../../src/types/error.ts";

const authService = await import("../../src/services/auth-service.ts");
const authServiceMock = {
    ...authService,

    registerUserService: jest.fn<typeof authService.registerUserService>(),

    confirmEmailService: jest.fn<typeof authService.confirmEmailService>(),

    loginUserService: jest.fn<typeof authService.loginUserService>(),

    sendEmailForgotPasswordService:
        jest.fn<typeof authService.sendEmailForgotPasswordService>(),

    validateTokenService:
        jest.fn<typeof authService.validateTokenService>(),

    resetPasswordService:
        jest.fn<typeof authService.resetPasswordService>(),
};

jest.unstable_mockModule(
    "../../src/services/auth-service.ts",
    () => authServiceMock
);

const jwt = await import("../../src/utils/jwt.ts");
const jwtMock = {
    ...jwt,
    jwtGenerateToken: jest.fn<typeof jwt.jwtGenerateToken>(),
};
jest.unstable_mockModule(
    "../../src/utils/jwt.ts",
    () => jwtMock
);

const { default: app } = await import("../../src/app.js");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("POST /auth/register", () => {
    it("deve retornar 201 quando o body for válido", async () => {
        authServiceMock.registerUserService.mockResolvedValue();

        const response = await request(app)
            .post("/auth/register")
            .field("name", "John Doe")
            .field("email", "john@email.com")
            .field("password", "12345678");

        expect(authServiceMock.registerUserService).toHaveBeenCalledTimes(1);

        expect(authServiceMock.registerUserService).toHaveBeenCalledWith(
            {
                name: "John Doe",
                email: "john@email.com",
                password: "12345678",
            },
            undefined
        );

        expect(response.status).toBe(201);

        expect(response.headers["content-type"]).toMatch(/json/);

        expect(response.body).toEqual({
            message: "Email de confirmação enviado.",
        });
    });

    it("deve retornar 400 quando campos obrigatórios estiverem faltando", async () => {
        const response = await request(app)
            .post("/auth/register")
            .field("email", "john@email.com");

        expect(response.status).toBe(400);

        expect(response.headers["content-type"]).toMatch(/json/);
    });
});

describe("POST /auth/login", () => {
    it("deve retornar 200 quando as credenciais forem válidas", async () => {
        const user = {
            id: "1",
            name: "John Doe",
            email: "john@email.com",
            avatar: null,
        };

        authServiceMock.loginUserService.mockResolvedValue(user as any);
        jwtMock.jwtGenerateToken.mockResolvedValue("jwt-token");

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "john@email.com",
                password: "12345678",
            });

        expect(authServiceMock.loginUserService).toHaveBeenCalledTimes(1);

        expect(authServiceMock.loginUserService).toHaveBeenCalledWith({
            email: "john@email.com",
            password: "12345678",
        });

        expect(jwtMock.jwtGenerateToken).toHaveBeenCalledTimes(1);

        expect(jwtMock.jwtGenerateToken).toHaveBeenCalledWith({
            id: "1",
            email: "john@email.com",
        });

        expect(response.status).toBe(200);

        expect(response.headers["content-type"]).toMatch(/json/);

        expect(response.body).toEqual({
            token: "jwt-token",
            user,
        });
    });

    it("deve retornar 400 quando o body for inválido", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "john@email.com",
            });

        expect(authServiceMock.loginUserService).not.toHaveBeenCalled();

        expect(jwtMock.jwtGenerateToken).not.toHaveBeenCalled();

        expect(response.status).toBe(400);

        expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("deve encaminhar erro quando o login falhar", async () => {
        authServiceMock.loginUserService.mockRejectedValue(
            new AppError(ERRORS.invalidCredentials)
        );

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "john@email.com",
                password: "12345678",
            });

        expect(authServiceMock.loginUserService).toHaveBeenCalledTimes(1);

        expect(jwtMock.jwtGenerateToken).not.toHaveBeenCalled();

        expect(response.status).toBe(401);
    });
});

describe("GET /auth/confirm-email", () => {
    it("deve renderizar a página de sucesso quando o token for válido", async () => {
        authServiceMock.confirmEmailService.mockResolvedValue();

        const response = await request(app).get(
            "/auth/confirm-email?token=c2f5e1a9-9c3b-4d2a-a7c1-123456abcdef"
        );

        expect(response.status).toBe(200);

        expect(authServiceMock.confirmEmailService).toHaveBeenCalledWith(
            "c2f5e1a9-9c3b-4d2a-a7c1-123456abcdef"
        );

        expect(response.text).toContain("Email confirmado");
        expect(response.text).toContain("Seu email foi confirmado com sucesso.");
    });

    it("deve renderizar a página de erro quando o token não for informado", async () => {
        const response = await request(app).get(
            "/auth/confirm-email"
        );

        expect(authServiceMock.confirmEmailService).not.toHaveBeenCalled();

        expect(response.status).toBe(200);

        expect(response.text).toContain("Falha na confirmação");
        expect(response.text).toContain("O token é inválido ou expirou.");
    });

});

describe("POST /auth/send-forgot-password", () => {
    it("deve retornar 200", async () => {
        authServiceMock.sendEmailForgotPasswordService.mockResolvedValue();

        const response = await request(app)
            .post("/auth/send-forgot-password")
            .send({
                email: "teste@email.com",
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            message: "Se houver uma conta será enviado um email de recuperação",
        });

        expect(
            authServiceMock.sendEmailForgotPasswordService
        ).toHaveBeenCalledWith("teste@email.com");
    });

    it("deve retornar 429 quando o limite for excedido", async () => {
        authServiceMock.sendEmailForgotPasswordService.mockRejectedValue(
            new AppError(ERRORS.emailRequestLimitExceeded)
        );

        const response = await request(app)
            .post("/auth/send-forgot-password")
            .send({
                email: "teste@email.com",
            });

        expect(response.status).toBe(429);

        expect(response.body.error.code).toBe(
            "email_request_limit_exceeded"
        );
    });
});

describe("POST /auth/reset-password/validate", () => {
    it("GET /reset-password/validate deve validar token com sucesso", async () => {
        authServiceMock.validateTokenService.mockResolvedValue();

        const response = await request(app).get(
            "/auth/reset-password/validate?token=fake-token"
        );

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            message: "Token válido",
        });

        expect(
            authServiceMock.validateTokenService
        ).toHaveBeenCalledWith("fake-token");
    });

    it("GET /reset-password/validate deve retornar erro quando token for inválido", async () => {
        authServiceMock.validateTokenService.mockRejectedValue(
            new AppError(ERRORS.invalidToken)
        );

        const response = await request(app).get(
            "/auth/reset-password/validate?token=fake-token"
        );

        expect(response.body).toEqual({
            error: {
                code: ERRORS.invalidToken.code,
                message: ERRORS.invalidToken.message,
                details: null,
            },
        });

        expect(
            authServiceMock.validateTokenService
        ).toHaveBeenCalledWith("fake-token");
    });
});

describe("POST /auth/reset-password", () => {
    it("deve atualizar a senha quando o token for válido", async () => {
        authServiceMock.validateTokenService.mockResolvedValue();
        authServiceMock.resetPasswordService.mockResolvedValue();

        const response = await request(app)
            .post("/auth/reset-password")
            .send({
                token: "fake-token",
                newPassword: "NovaSenha@123",
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            message: "Senha atualizada com sucesso!",
        });

        expect(
            authServiceMock.validateTokenService
        ).toHaveBeenCalledWith("fake-token");

        expect(
            authServiceMock.resetPasswordService
        ).toHaveBeenCalledWith(
            "fake-token",
            "NovaSenha@123"
        );
    });

    it("deve retornar erro quando o token for inválido", async () => {
        authServiceMock.validateTokenService.mockRejectedValue(
            new AppError(ERRORS.invalidToken)
        );

        const response = await request(app)
            .post("/auth/reset-password")
            .send({
                token: "fake-token",
                newPassword: "NovaSenha@123",
            });

        expect(response.status).toBe(400); // ou o status definido pelo seu AppError

        expect(
            authServiceMock.validateTokenService
        ).toHaveBeenCalledWith("fake-token");

        expect(
            authServiceMock.resetPasswordService
        ).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando o body for inválido", async () => {
        const response = await request(app)
            .post("/auth/reset-password")
            .send({
                token: "fake-token",
            });

        expect(response.status).toBe(400);

        expect(
            authServiceMock.validateTokenService
        ).not.toHaveBeenCalled();

        expect(
            authServiceMock.resetPasswordService
        ).not.toHaveBeenCalled();
    });
});