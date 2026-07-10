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

type UserRepository =
    typeof import("../../src/repositories/user-repository.ts");

type WelcomeTemplateProvider =
    typeof import("../../src/providers/mail/welcome-template.ts");

type NodeMailProvider =
    typeof import("../../src/providers/mail/node-mail.ts");

type StorageProvider =
    typeof import("../../src/providers/s3-storage.ts");

type Bcrypt =
    typeof import("bcryptjs");


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

const storageProviderMock = {
    ...actualStorageProvider,

    getStorageFile:
        jest.fn<typeof actualStorageProvider.getStorageFile>(),
};

const bcryptMock = {
    default: {
        compare: jest.fn<
            (
                data: string,
                encrypted: string
            ) => Promise<boolean>
        >(),
    },
};

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


const { confirmEmailService, loginUserService, } = await import(
    "../../src/services/auth-service.ts"
);

beforeEach(() => {
    jest.clearAllMocks();

    welcomeTemplateMock.welcomeTemplate.mockReturnValue(
        "<h1>Bem-vindo!</h1>"
    );
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