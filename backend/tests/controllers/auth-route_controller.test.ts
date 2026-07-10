import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import request from "supertest";
import { AppError, ERRORS } from "../../src/types/error.ts";

const authService = await import("../../src/services/auth-service.ts");
const authServiceMock = {
    ...authService,

    registerUserService: jest.fn<typeof authService.registerUserService>(),

    confirmEmailService: jest.fn<typeof authService.confirmEmailService>(),

    loginUserService: jest.fn<typeof authService.loginUserService>()

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

const { confirmEmailController } = await import(
    "../../src/controllers/auth-controller.ts"
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
    let request: Partial<Request>;
    let response: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        request = {};

        response = {
            render: jest.fn(),
        };

        next = jest.fn();
    });

    it("deve renderizar a página de sucesso quando o token for válido", async () => {
        authServiceMock.confirmEmailService.mockResolvedValue();

        request.query = {
            token: "c2f5e1a9-9c3b-4d2a-a7c1-123456abcdef",
        };

        await confirmEmailController(
            request as Request,
            response as Response,
            next
        );

        expect(authServiceMock.confirmEmailService).toHaveBeenCalledTimes(1);

        expect(authServiceMock.confirmEmailService).toHaveBeenCalledWith(
            "c2f5e1a9-9c3b-4d2a-a7c1-123456abcdef"
        );

        expect(response.render).toHaveBeenCalledWith(
            "confirmation",
            expect.objectContaining({
                success: true,
                title: "Email confirmado",
                message: "Seu email foi confirmado com sucesso.",
                loginUrl: expect.stringContaining("/login"),
            })
        );
    });

    it("deve renderizar a página de erro quando o token for inválido", async () => {
        authServiceMock.confirmEmailService.mockRejectedValue(
            new Error("Invalid token")
        );

        request.query = {
            token: "invalid-token",
        };

        await confirmEmailController(
            request as Request,
            response as Response,
            next
        );

        expect(authServiceMock.confirmEmailService).toHaveBeenCalledWith(
            "invalid-token"
        );

        expect(response.render).toHaveBeenCalledWith(
            "confirmation",
            expect.objectContaining({
                success: false,
                title: "Falha na confirmação",
                message: "O token é inválido ou expirou.",
            })
        );
    });

    it("deve renderizar a página de erro quando o token não for informado", async () => {
        request.query = {};

        await confirmEmailController(
            request as Request,
            response as Response,
            next
        );

        expect(authServiceMock.confirmEmailService).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
            "confirmation",
            expect.objectContaining({
                success: false,
                title: "Falha na confirmação",
                message: "O token é inválido ou expirou.",
            })
        );
    });
});