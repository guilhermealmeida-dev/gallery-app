import { describe, it, expect, jest, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";

beforeAll(() => {
    jest.spyOn(console, "log")
        .mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe("POST /auth/register", () => {


    it("deve retornar 201 quando o body for válido", async () => {


        const response = await request(app)
            .post("/auth/register")
            .field("name", "John Doe")
            .field("email", "john@email.com")
            .field("password", "12345678");


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