import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";

type ConfirmationEmailRepository =
    typeof import("../../src/repositories/confirmation-email-repository.ts");

type WelcomeTemplateProvider =
    typeof import("../../src/providers/mail/welcome-template.ts");

type NodeMailProvider =
    typeof import("../../src/providers/mail/node-mail.ts");

type ConfirmEmailTemplateProvider =
    typeof import("../../src/providers/mail/confirm-email-template.ts");

const actualStorageProvider = await import(
    "../../src/providers/s3-storage.ts"
);

const actualUserRepository = await import(
    "../../src/repositories/user-repository.ts"
);

const confirmationEmailRepositoryMock = {
    createEmailConfirmationReposytory:
        jest.fn() as jest.MockedFunction<
            ConfirmationEmailRepository["createEmailConfirmationReposytory"]
        >,

    findEmailConfirmationRepository:
        jest.fn() as jest.MockedFunction<
            ConfirmationEmailRepository["findEmailConfirmationRepository"]
        >,

    deletEmailConfirmationReposytory:
        jest.fn() as jest.MockedFunction<
            ConfirmationEmailRepository["deletEmailConfirmationReposytory"]
        >,
};

const userRepositoryMock = {
    ...actualUserRepository,

    updateUserRepository:
        jest.fn<typeof actualUserRepository.updateUserRepository>(),
    findUserByEmailRepository:
        jest.fn<typeof actualUserRepository.findUserByEmailRepository>(),
    createUserRepository:
        jest.fn<typeof actualUserRepository.createUserRepository>(),
};

const welcomeTemplateMock = {
    welcomeTemplate:
        jest.fn() as jest.MockedFunction<
            WelcomeTemplateProvider["welcomeTemplate"]
        >,
};

const nodeMailMock = {
    sendEmail:
        jest.fn() as jest.MockedFunction<
            NodeMailProvider["sendEmail"]
        >,
};

const bcryptMock = {
    default: {
        compare: jest.fn<
            (
                data: string,
                encrypted: string
            ) => Promise<boolean>
        >(),
        hash: jest.fn<
            (
                data: string,
                salt: number
            ) => Promise<string>
        >(),
    },
};

const confirmEmailTemplateMock = {
    confirmEmailTemplate:
        jest.fn() as jest.MockedFunction<
            ConfirmEmailTemplateProvider["confirmEmailTemplate"]
        >,
};

const storageProviderMock = {
    ...actualStorageProvider,
    getStorageFile:
        jest.fn<typeof actualStorageProvider.getStorageFile>(),
    uploadStorageFile:
        jest.fn<typeof actualStorageProvider.uploadStorageFile>(),
};

jest.unstable_mockModule(
    "../../src/providers/mail/confirm-email-template.ts",
    () => confirmEmailTemplateMock
);

jest.unstable_mockModule(
    "../../src/providers/s3-storage.ts",
    () => storageProviderMock
);

jest.unstable_mockModule(
    "uuid",
    () => ({
        v4: jest.fn(() => "fake-confirmation-token"),
    })
);

jest.unstable_mockModule("bcryptjs", () => bcryptMock);

jest.unstable_mockModule(
    "../../src/repositories/confirmation-email-repository.ts",
    () => confirmationEmailRepositoryMock
);

jest.unstable_mockModule(
    "../../src/repositories/user-repository.ts",
    () => userRepositoryMock
);

jest.unstable_mockModule(
    "../../src/providers/mail/welcome-template.ts",
    () => welcomeTemplateMock
);

jest.unstable_mockModule(
    "../../src/providers/mail/node-mail.ts",
    () => nodeMailMock
);

jest.unstable_mockModule(
    "../../src/providers/s3-storage.ts",
    () => storageProviderMock
);

jest.unstable_mockModule(
    "../../src/providers/mail/confirm-email-template.ts",
    () => confirmEmailTemplateMock
);

jest.unstable_mockModule(
    "../../src/providers/s3-storage.ts",
    () => storageProviderMock
);

const {
    confirmEmailService,
    loginUserService,
    registerUserService,
} = await import(
    "../../src/services/auth-service.ts"
);

beforeEach(() => {
    jest.clearAllMocks();

    welcomeTemplateMock.welcomeTemplate.mockReturnValue(
        "<h1>Bem-vindo!</h1>"
    );
});

describe("registerUserService", () => {

    it("deve registrar usuário com sucesso sem avatar", async () => {

        userRepositoryMock.findUserByEmailRepository
            .mockResolvedValue(null);

        userRepositoryMock.createUserRepository
            .mockResolvedValue({
                id: "user-id",
                name: "John Doe",
                email: "john@email.com",
                password: "hashed-password",
                avatar: null,
            } as any);


        confirmEmailTemplateMock.confirmEmailTemplate
            .mockReturnValue("<h1>Confirmar email</h1>");

        await registerUserService({
            name: "John Doe",
            email: "john@email.com",
            password: "12345678",
        });


        expect(
            userRepositoryMock.findUserByEmailRepository
        ).toHaveBeenCalledWith(
            "john@email.com"
        );


        expect(
            userRepositoryMock.createUserRepository
        ).toHaveBeenCalledTimes(1);


        expect(
            confirmationEmailRepositoryMock
                .createEmailConfirmationReposytory
        ).toHaveBeenCalledWith(
            "user-id",
            "fake-confirmation-token"
        );


        expect(
            nodeMailMock.sendEmail
        ).toHaveBeenCalledWith({
            to: "john@email.com",
            subject: "Confirmação de email",
            html: "<h1>Confirmar email</h1>",
        });


        expect(
            storageProviderMock.uploadStorageFile
        ).not.toHaveBeenCalled();
    });


    it("deve registrar usuário enviando avatar", async () => {

        userRepositoryMock.findUserByEmailRepository
            .mockResolvedValue(null);


        userRepositoryMock.createUserRepository
            .mockResolvedValue({
                id: "user-id",
                name: "John Doe",
                email: "john@email.com",
                password: "hashed-password",
                avatar: null,
            } as any);


        storageProviderMock.uploadStorageFile
            .mockResolvedValue(
                "profiles/user-id/avatar.png"
            );


        confirmEmailTemplateMock.confirmEmailTemplate
            .mockReturnValue(
                "<h1>Confirmar email</h1>"
            );


        const avatar = {
            originalname: "avatar.png",
            mimetype: "image/png",
            buffer: Buffer.from("fake-image"),
        } as Express.Multer.File;



        await registerUserService(
            {
                name: "John Doe",
                email: "john@email.com",
                password: "12345678",
            },
            avatar
        );


        expect(
            storageProviderMock.uploadStorageFile
        ).toHaveBeenCalledTimes(1);


        expect(
            userRepositoryMock.updateUserRepository
        ).toHaveBeenCalledWith(
            "user-id",
            {
                avatar: "profiles/user-id/avatar.png"
            }
        );
    });


    it("deve lançar erro quando email já existir", async () => {

        userRepositoryMock.findUserByEmailRepository
            .mockResolvedValue({
                id: "existing-user",
                email: "john@email.com"
            } as any);



        await expect(
            registerUserService({
                name: "John Doe",
                email: "john@email.com",
                password: "12345678",
            })
        ).rejects.toThrow();



        expect(
            userRepositoryMock.createUserRepository
        ).not.toHaveBeenCalled();


        expect(
            nodeMailMock.sendEmail
        ).not.toHaveBeenCalled();
    });

});

describe("loginUserService", () => {
    it("deve realizar login com sucesso", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue({
            id: "user-id",
            name: "John Doe",
            email: "john@email.com",
            password: "hashed-password",
            avatar: "avatar.png",
            isVerify: true,
        } as any);

        bcryptMock.default.compare.mockResolvedValue(true);

        storageProviderMock.getStorageFile.mockResolvedValue(
            Buffer.from("fake-avatar")
        );

        const result = await loginUserService({
            email: "john@email.com",
            password: "12345678",
        });

        expect(
            userRepositoryMock.findUserByEmailRepository
        ).toHaveBeenCalledTimes(1);

        expect(
            userRepositoryMock.findUserByEmailRepository
        ).toHaveBeenCalledWith("john@email.com");

        expect(bcryptMock.default.compare).toHaveBeenCalledTimes(1);

        expect(bcryptMock.default.compare).toHaveBeenCalledWith(
            "12345678",
            "hashed-password"
        );

        expect(storageProviderMock.getStorageFile).toHaveBeenCalledTimes(1);

        expect(result).toEqual({
            id: "user-id",
            name: "John Doe",
            email: "john@email.com",
            avatar: Buffer.from("fake-avatar"),
        });
    });

    it("deve retornar avatar nulo quando o usuário não possuir avatar", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue({
            id: "user-id",
            name: "John Doe",
            email: "john@email.com",
            password: "hashed-password",
            avatar: null,
            isVerify: true,
        } as any);

        bcryptMock.default.compare.mockResolvedValue(true);

        const result = await loginUserService({
            email: "john@email.com",
            password: "12345678",
        });

        expect(storageProviderMock.getStorageFile).not.toHaveBeenCalled();

        expect(result).toEqual({
            id: "user-id",
            name: "John Doe",
            email: "john@email.com",
            avatar: null,
        });
    });

    it("deve lançar erro quando o usuário não existir", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue(null);

        await expect(
            loginUserService({
                email: "john@email.com",
                password: "12345678",
            })
        ).rejects.toThrow();

        expect(bcryptMock.default.compare).not.toHaveBeenCalled();

        expect(storageProviderMock.getStorageFile).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando o usuário não estiver verificado", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue({
            id: "user-id",
            name: "John Doe",
            email: "john@email.com",
            password: "hashed-password",
            avatar: "avatar.png",
            isVerify: false,
        } as any);

        await expect(
            loginUserService({
                email: "john@email.com",
                password: "12345678",
            })
        ).rejects.toThrow();

        expect(bcryptMock.default.compare).not.toHaveBeenCalled();

        expect(storageProviderMock.getStorageFile).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando a senha estiver incorreta", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue({
            id: "user-id",
            name: "John Doe",
            email: "john@email.com",
            password: "hashed-password",
            avatar: "avatar.png",
            isVerify: true,
        } as any);

        bcryptMock.default.compare.mockResolvedValue(false);

        await expect(
            loginUserService({
                email: "john@email.com",
                password: "senha-incorreta",
            })
        ).rejects.toThrow();

        expect(bcryptMock.default.compare).toHaveBeenCalledTimes(1);

        expect(storageProviderMock.getStorageFile).not.toHaveBeenCalled();
    });
});

describe("confirmEmailService", () => {
    it("deve confirmar o e-mail do usuário", async () => {
        confirmationEmailRepositoryMock.findEmailConfirmationRepository.mockResolvedValue(
            {
                id: "confirmation-id",
                token: "token-123",
                userid: "user-id",
                user: {
                    name: "John Doe",
                    email: "john@email.com",
                },
            }
        );

        await confirmEmailService("token-123");

        expect(
            confirmationEmailRepositoryMock.findEmailConfirmationRepository
        ).toHaveBeenCalledTimes(1);

        expect(
            confirmationEmailRepositoryMock.findEmailConfirmationRepository
        ).toHaveBeenCalledWith("token-123");

        expect(
            userRepositoryMock.updateUserRepository
        ).toHaveBeenCalledTimes(1);

        expect(
            userRepositoryMock.updateUserRepository
        ).toHaveBeenCalledWith("user-id", {
            isVerify: true,
        });

        expect(
            confirmationEmailRepositoryMock.deletEmailConfirmationReposytory
        ).toHaveBeenCalledTimes(1);

        expect(
            confirmationEmailRepositoryMock.deletEmailConfirmationReposytory
        ).toHaveBeenCalledWith("confirmation-id");

        expect(
            welcomeTemplateMock.welcomeTemplate
        ).toHaveBeenCalledTimes(1);

        expect(
            welcomeTemplateMock.welcomeTemplate
        ).toHaveBeenCalledWith({
            name: "John Doe",
            loginUrl: expect.any(String),
        });

        expect(
            nodeMailMock.sendEmail
        ).toHaveBeenCalledTimes(1);

        expect(
            nodeMailMock.sendEmail
        ).toHaveBeenCalledWith({
            to: "john@email.com",
            subject: "Boa vindas",
            html: "<h1>Bem-vindo!</h1>",
        });
    });

    it("deve lançar erro quando o token não existir", async () => {
        confirmationEmailRepositoryMock.findEmailConfirmationRepository.mockResolvedValue(
            null
        );
        confirmationEmailRepositoryMock.findEmailConfirmationRepository.mockResolvedValue(null);

        const result =
            await confirmationEmailRepositoryMock.findEmailConfirmationRepository("invalid-token");

        console.log(result);
        await expect(
            confirmEmailService("invalid_token")
        ).rejects.toThrow();

        expect(
            userRepositoryMock.updateUserRepository
        ).not.toHaveBeenCalled();

        expect(
            confirmationEmailRepositoryMock.deletEmailConfirmationReposytory
        ).not.toHaveBeenCalled();

        expect(
            welcomeTemplateMock.welcomeTemplate
        ).not.toHaveBeenCalled();

        expect(
            nodeMailMock.sendEmail
        ).not.toHaveBeenCalled();
    });
});