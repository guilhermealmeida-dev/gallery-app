import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
    jest
} from "@jest/globals";

import request from "supertest";

import type { CrateUserOutput } from "../../src/types/user.ts";


type RegisterUserService = (
    dto: {
        name: string;
        email: string;
        password: string;
    },
    avatar?: Express.Multer.File
) => Promise<CrateUserOutput>;


const registerUserServiceMock = jest.fn() as jest.MockedFunction<RegisterUserService>;

jest.unstable_mockModule(
    "../../src/services/auth-service.ts",
    () => ({
        registerUserService: registerUserServiceMock
    })
);


const { default: app } = await import(
    "../../src/app.js"
);


describe("POST /auth/register", () => {


    beforeEach(() => {
        jest.clearAllMocks();
    });


    afterAll(() => {
        jest.restoreAllMocks();
    });


    it("deve retornar 201 quando o body for válido", async () => {


        registerUserServiceMock.mockResolvedValue({
            id: "user-id",
            name: "John Doe",
            email: "john@email.com"
        } as CrateUserOutput);


        const response = await request(app)
            .post("/auth/register")
            .field("name", "John Doe")
            .field("email", "john@email.com")
            .field("password", "12345678");


        expect(registerUserServiceMock)
            .toHaveBeenCalledTimes(1);


        expect(registerUserServiceMock)
            .toHaveBeenCalledWith(
                {
                    name: "John Doe",
                    email: "john@email.com",
                    password: "12345678"
                },
                undefined
            );


        expect(response.status)
            .toBe(201);


        expect(response.headers["content-type"])
            .toMatch(/json/);


        expect(response.body)
            .toEqual({
                message: "Emeil de confirmação enviado."
            });

    });

    it("deve retornar 400 quando campos obrigatórios estiverem faltando", async () => {


        const response = await request(app)
            .post("/auth/register")
            .field("email", "john@email.com");


        expect(response.status)
            .toBe(400);


        expect(response.headers["content-type"])
            .toMatch(/json/);
    });
});