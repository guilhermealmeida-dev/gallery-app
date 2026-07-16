import {
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";

import request from "supertest";
import { AppError, ERRORS } from "../../src/types/error.ts";


// Mock do middleware de autenticação
jest.unstable_mockModule(
    "../../src/middlewares/auth-guard.ts",
    () => ({
        authGuard: (
            req: any,
            res: any,
            next: any
        ) => {
            req.user = {
                id: "user-id",
            };

            next();
        },
    })
);


// Import do serviço após o mock
const userService = await import(
    "../../src/services/user-service.ts"
);


const userServiceMock = {
    ...userService,

    getUserService:
        jest.fn<typeof userService.getUserService>(),

    updateUserService:
        jest.fn<typeof userService.updateUserService>(),

    updateUserAvatarService:
        jest.fn<typeof userService.updateUserAvatarService>(),
};


// Mock do service
jest.unstable_mockModule(
    "../../src/services/user-service.ts",
    () => userServiceMock
);


// Import da aplicação sempre por último
const { default: app } = await import(
    "../../src/app.ts"
);


beforeEach(() => {
    jest.clearAllMocks();
});


describe("GET /user/me", () => {

    it("deve retornar o usuário autenticado", async () => {

        const user = {
            id: "user-id",
            name: "John Doe",
            email: "john@email.com",
            avatar: null,
        };


        userServiceMock.getUserService
            .mockResolvedValue(user as any);


        const response = await request(app)
            .get("/user/me");


        expect(response.status)
            .toBe(200);


        expect(response.body)
            .toEqual(user);


        expect(
            userServiceMock.getUserService
        ).toHaveBeenCalledTimes(1);


        expect(
            userServiceMock.getUserService
        ).toHaveBeenCalledWith(
            "user-id"
        );
    });


    it("deve retornar erro quando o serviço lançar exceção", async () => {

        userServiceMock.getUserService
            .mockRejectedValue(
                new AppError(ERRORS.notfoundUser)
            );


        const response = await request(app)
            .get("/user/me");


        expect(response.status)
            .toBe(404);


        expect(
            userServiceMock.getUserService
        ).toHaveBeenCalledTimes(1);
    });

});



describe("PUT /user/me", () => {


    it("deve atualizar o nome do usuário", async () => {

        const body = {
            name: "Novo Nome",
        };


        const updatedUser = {
            id: "user-id",
            name: "Novo Nome",
            email: "john@email.com",
            avatar: null,
        };


        userServiceMock.updateUserService
            .mockResolvedValue(
                updatedUser as any
            );


        const response = await request(app)
            .put("/user/me")
            .send(body);


        expect(response.status)
            .toBe(200);


        expect(response.body)
            .toEqual(updatedUser);


        expect(
            userServiceMock.updateUserService
        ).toHaveBeenCalledWith(
            "user-id",
            body
        );
    });



    it("deve atualizar a senha", async () => {

        const body = {
            password: "12345678",
        };


        userServiceMock.updateUserService
            .mockResolvedValue({
                id: "user-id",
            } as any);


        const response = await request(app)
            .put("/user/me")
            .send(body);


        expect(response.status)
            .toBe(200);


        expect(
            userServiceMock.updateUserService
        ).toHaveBeenCalledWith(
            "user-id",
            body
        );
    });



    it("deve retornar 400 quando o body for inválido", async () => {

        const response = await request(app)
            .put("/user/me")
            .send({
                password: "123",
            });


        expect(response.status)
            .toBe(400);


        expect(
            userServiceMock.updateUserService
        ).not.toHaveBeenCalled();
    });



    it("deve encaminhar erro quando o serviço lançar exceção", async () => {

        userServiceMock.updateUserService
            .mockRejectedValue(
                new AppError(ERRORS.notfoundUser)
            );


        const response = await request(app)
            .put("/user/me")
            .send({
                name: "Novo Nome",
            });


        expect(response.status)
            .toBe(404);


        expect(
            userServiceMock.updateUserService
        ).toHaveBeenCalledTimes(1);
    });

});



describe("PUT /users/me/avatar", () => {


    it("deve atualizar o avatar", async () => {

        const avatar =
            "https://bucket.s3.amazonaws.com/avatar.png";


        userServiceMock.updateUserAvatarService
            .mockResolvedValue(
                avatar as any
            );


        const response = await request(app)
            .put("/user/me/avatar")
            .attach(
                "avatar",
                Buffer.from("fake-image"),
                "avatar.png"
            );


        expect(response.status)
            .toBe(200);


        expect(response.body)
            .toEqual({
                avatar,
            });


        expect(
            userServiceMock.updateUserAvatarService
        ).toHaveBeenCalledTimes(1);


        expect(
            userServiceMock.updateUserAvatarService
        ).toHaveBeenCalledWith(
            "user-id",
            expect.objectContaining({
                originalname: "avatar.png",
                buffer: expect.any(Buffer),
                mimetype: expect.any(String),
            })
        );
    });



    it("deve retornar 400 quando nenhuma imagem for enviada", async () => {

        const response = await request(app)
            .put("/user/me/avatar");


        expect(response.status)
            .toBe(400);


        expect(
            userServiceMock.updateUserAvatarService
        ).not.toHaveBeenCalled();
    });



    it("deve encaminhar erro quando o serviço lançar exceção", async () => {

        userServiceMock.updateUserAvatarService
            .mockRejectedValue(
                new AppError(ERRORS.notfoundUser)
            );


        const response = await request(app)
            .put("/user/me/avatar")
            .attach(
                "avatar",
                Buffer.from("fake-image"),
                "avatar.png"
            );


        expect(response.status)
            .toBe(404);


        expect(
            userServiceMock.updateUserAvatarService
        ).toHaveBeenCalledTimes(1);


        expect(
            userServiceMock.updateUserAvatarService
        ).toHaveBeenCalledWith(
            "user-id",
            expect.objectContaining({
                originalname: "avatar.png",
            })
        );
    });

});