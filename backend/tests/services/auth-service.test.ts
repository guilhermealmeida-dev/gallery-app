import {
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";
import { AppError, ERRORS } from "../../src/types/error.ts";

type ForgotPasswordTemplateProvider =
    typeof import("../../src/providers/mail/forgot-password-template.ts");

type ConfirmationEmailRepository =
    typeof import("../../src/repositories/confirmation-email-repository.ts");

type WelcomeTemplateProvider =
    typeof import("../../src/providers/mail/welcome-template.ts");

type NodeMailProvider =
    typeof import("../../src/providers/mail/node-mail.ts");

type ConfirmEmailTemplateProvider =
    typeof import("../../src/providers/mail/confirm-email-template.ts");

type PasswordUpdatedTemplateProvider =
    typeof import("../../src/providers/mail/password-updated-template.ts");

const passwordUpdatedTemplateMock = {
    passwordUpdatedTemplate:
        jest.fn() as jest.MockedFunction<
            PasswordUpdatedTemplateProvider["passwordUpdatedTemplate"]
        >,
};

const forgotPasswordTemplateMock = {
    forgotPasswordTemplate:
        jest.fn() as jest.MockedFunction<
            ForgotPasswordTemplateProvider["forgotPasswordTemplate"]
        >,
};

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

    findValidEmailConfirmationRepository:
        jest.fn() as jest.MockedFunction<
            ConfirmationEmailRepository["findValidEmailConfirmationRepository"]
        >,

    deletEmailConfirmationReposytory:
        jest.fn() as jest.MockedFunction<
            ConfirmationEmailRepository["deletEmailConfirmationReposytory"]
        >,

    countEmailConfirmationByUserId:
        jest.fn() as jest.MockedFunction<
            ConfirmationEmailRepository["countEmailConfirmationByUserId"]
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
    "../../src/utils/jwt.js",
    () => ({
        jwtGenerateToken: jest.fn(),
        jwtVerify: jest.fn(),
        jwtdecode: jest.fn(),
    })
);
const jwtModule = await import("../../src/utils/jwt.js");

jest.unstable_mockModule(
    "../../src/providers/mail/password-updated-template.ts",
    () => passwordUpdatedTemplateMock
);

jest.unstable_mockModule(
    "../../src/providers/mail/forgot-password-template.ts",
    () => forgotPasswordTemplateMock
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
    "../../src/providers/mail/confirm-email-template.ts",
    () => confirmEmailTemplateMock
);

const {
    confirmEmailService,
    loginUserService,
    registerUserService,
    sendEmailForgotPasswordService,
    validateTokenService,
    resetPasswordService
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

        expect(confirmationEmailRepositoryMock.createEmailConfirmationReposytory).toHaveBeenCalledWith(
            "user-id",
            "fake-confirmation-token",
            expect.any(Date)
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

        jwtModule.jwtGenerateToken.mockResolvedValue("fake-token");

        const result = await loginUserService({
            email: "john@email.com",
            password: "12345678",
        });

        expect(
            userRepositoryMock.findUserByEmailRepository
        ).toHaveBeenCalledWith("john@email.com");

        expect(bcryptMock.default.compare).toHaveBeenCalledWith(
            "12345678",
            "hashed-password"
        );

        expect(storageProviderMock.getStorageFile).toHaveBeenCalledTimes(1);

        expect(storageProviderMock.getStorageFile).toHaveBeenCalledWith(
            "PROFILES",
            "avatar.png"
        );

        jwtModule.jwtGenerateToken.mockReturnValue("fake-token");

        expect(result).toEqual({
            token: "fake-token",
            user: {
                id: "user-id",
                name: "John Doe",
                email: "john@email.com",
                avatar: Buffer.from("fake-avatar"),
            },
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

        jwtModule.jwtGenerateToken.mockReturnValue("fake-token");

        const result = await loginUserService({
            email: "john@email.com",
            password: "12345678",
        });

        expect(result).toEqual({
            token: "fake-token",
            user: {
                id: "user-id",
                name: "John Doe",
                email: "john@email.com",
                avatar: null,
            },
        });
    });

    it("deve lançar invalidCredentials quando o usuário não existir", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue(null);

        await expect(
            loginUserService({
                email: "john@email.com",
                password: "12345678",
            })
        ).rejects.toEqual(new AppError(ERRORS.invalidCredentials));

        expect(bcryptMock.default.compare).not.toHaveBeenCalled();
        expect(storageProviderMock.getStorageFile).not.toHaveBeenCalled();
    });

    it("deve lançar userNotVerified quando o usuário não estiver verificado", async () => {
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
        ).rejects.toEqual(new AppError(ERRORS.userNotVerified));

        expect(bcryptMock.default.compare).not.toHaveBeenCalled();
        expect(storageProviderMock.getStorageFile).not.toHaveBeenCalled();
    });

    it("deve lançar invalidCredentials quando a senha estiver incorreta", async () => {
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
        ).rejects.toEqual(new AppError(ERRORS.invalidCredentials));

        expect(bcryptMock.default.compare).toHaveBeenCalledWith(
            "senha-incorreta",
            "hashed-password"
        );

        expect(storageProviderMock.getStorageFile).not.toHaveBeenCalled();
    });
});

describe("confirmEmailService", () => {
    it("deve confirmar o e-mail do usuário", async () => {
        confirmationEmailRepositoryMock.findValidEmailConfirmationRepository.mockResolvedValue(
            {
                id: "confirmation-id",
                token: "token-123",
                userid: "user-id",
                user: {
                    name: "John Doe",
                    email: "john@email.com",
                },
                date: new Date()
            }
        );

        await confirmEmailService("token-123");

        expect(
            confirmationEmailRepositoryMock.findValidEmailConfirmationRepository
        ).toHaveBeenCalledTimes(1);

        expect(
            confirmationEmailRepositoryMock.findValidEmailConfirmationRepository
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
        confirmationEmailRepositoryMock.findValidEmailConfirmationRepository.mockResolvedValue(
            null
        );
        confirmationEmailRepositoryMock.findValidEmailConfirmationRepository.mockResolvedValue(null);

        const result =
            await confirmationEmailRepositoryMock.findValidEmailConfirmationRepository("invalid-token");

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

describe("sendEmailForgotPasswordService", () => {
    it("deve enviar e-mail de recuperação de senha com sucesso", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue({
            id: "user-id",
            name: "Guilherme",
            email: "gui@email.com",
            password: "hash",
            avatar: null,
            isVerify: true,
        });

        confirmationEmailRepositoryMock.countEmailConfirmationByUserId.mockResolvedValue(
            0
        );

        const forgotTemplate = "<h1>Recuperar senha</h1>";

        forgotPasswordTemplateMock.forgotPasswordTemplate.mockReturnValue(
            forgotTemplate
        );

        await sendEmailForgotPasswordService("gui@email.com");

        expect(
            confirmationEmailRepositoryMock.countEmailConfirmationByUserId
        ).toHaveBeenCalledWith("user-id");

        expect(
            confirmationEmailRepositoryMock.createEmailConfirmationReposytory
        ).toHaveBeenCalledWith(
            "user-id",
            "fake-confirmation-token",
            expect.any(Date)
        );

        expect(nodeMailMock.sendEmail).toHaveBeenCalledWith({
            to: "gui@email.com",
            subject: "Recuperaçao de Senha",
            html: forgotTemplate,
        });
    });

    it("não deve fazer nada quando usuário não existir", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue(null);

        await expect(
            sendEmailForgotPasswordService("gui@email.com")
        ).resolves.toBeUndefined();

        expect(
            confirmationEmailRepositoryMock.countEmailConfirmationByUserId
        ).not.toHaveBeenCalled();

        expect(
            confirmationEmailRepositoryMock.createEmailConfirmationReposytory
        ).not.toHaveBeenCalled();

        expect(nodeMailMock.sendEmail).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando usuário atingir limite de solicitações", async () => {
        userRepositoryMock.findUserByEmailRepository.mockResolvedValue({
            id: "user-id",
            name: "Guilherme",
            email: "gui@email.com",
            password: "hash",
            avatar: null,
            isVerify: true,
        });

        confirmationEmailRepositoryMock.countEmailConfirmationByUserId.mockResolvedValue(
            5
        );

        await expect(
            sendEmailForgotPasswordService("gui@email.com")
        ).rejects.toThrow(ERRORS.emailRequestLimitExceeded.message);

        expect(
            confirmationEmailRepositoryMock.createEmailConfirmationReposytory
        ).not.toHaveBeenCalled();

        expect(nodeMailMock.sendEmail).not.toHaveBeenCalled();
    });
});

describe("validateTokenService", () => {
    it("deve validar um token existente", async () => {
        confirmationEmailRepositoryMock
            .findValidEmailConfirmationRepository
            .mockResolvedValue({
                id: "confirmation-id",
                userId: "user-id",
                token: "fake-token",
                createdAt: new Date(),
            } as any);

        await expect(
            validateTokenService("fake-token")
        ).resolves.toBeUndefined();

        expect(
            confirmationEmailRepositoryMock
                .findValidEmailConfirmationRepository
        ).toHaveBeenCalledTimes(1);

        expect(
            confirmationEmailRepositoryMock
                .findValidEmailConfirmationRepository
        ).toHaveBeenCalledWith("fake-token");
    });

    it("deve lançar erro quando o token for inválido", async () => {
        confirmationEmailRepositoryMock
            .findValidEmailConfirmationRepository
            .mockResolvedValue(null);

        await expect(
            validateTokenService("fake-token")
        ).rejects.toThrow(AppError);

        await expect(
            validateTokenService("fake-token")
        ).rejects.toMatchObject({
            code: ERRORS.invalidToken.code,
            status: ERRORS.invalidToken.status,
        });

        expect(
            confirmationEmailRepositoryMock
                .findValidEmailConfirmationRepository
        ).toHaveBeenCalledTimes(2);

        expect(
            confirmationEmailRepositoryMock
                .findValidEmailConfirmationRepository
        ).toHaveBeenCalledWith("fake-token");
    });
});

describe("resetPasswordService", () => {
    it("deve lançar erro quando o token for inválido", async () => {
        confirmationEmailRepositoryMock.findValidEmailConfirmationRepository.mockResolvedValue(
            null
        );

        await expect(
            resetPasswordService("invalid-token", "NovaSenha123")
        ).rejects.toThrow(new AppError(ERRORS.invalidToken));

        expect(
            confirmationEmailRepositoryMock.findValidEmailConfirmationRepository
        ).toHaveBeenCalledWith("invalid-token");

        expect(bcryptMock.default.hash).not.toHaveBeenCalled();
        expect(userRepositoryMock.updateUserRepository).not.toHaveBeenCalled();
        expect(
            confirmationEmailRepositoryMock.deletEmailConfirmationReposytory
        ).not.toHaveBeenCalled();
        expect(nodeMailMock.sendEmail).not.toHaveBeenCalled();
    })
    it("deve atualizar a senha, remover o token e enviar email", async () => {
        confirmationEmailRepositoryMock.findValidEmailConfirmationRepository.mockResolvedValue(
            {
                id: "confirmation-id",
                userid: "user-id",
                user: {
                    name: "John",
                    email: "john@email.com",
                },
            } as any
        );

        bcryptMock.default.hash.mockResolvedValue("hashed-password");

        passwordUpdatedTemplateMock.passwordUpdatedTemplate.mockReturnValue(
            "<h1>Senha alterada</h1>"
        );

        await resetPasswordService(
            "valid-token",
            "NovaSenha123"
        );

        expect(
            confirmationEmailRepositoryMock.findValidEmailConfirmationRepository
        ).toHaveBeenCalledWith("valid-token");

        expect(bcryptMock.default.hash).toHaveBeenCalledWith(
            "NovaSenha123",
            10
        );

        expect(
            userRepositoryMock.updateUserRepository
        ).toHaveBeenCalledWith("user-id", {
            password: "hashed-password",
        });

        expect(
            confirmationEmailRepositoryMock.deletEmailConfirmationReposytory
        ).toHaveBeenCalledWith("confirmation-id");

        expect(
            passwordUpdatedTemplateMock.passwordUpdatedTemplate
        ).toHaveBeenCalledWith({
            name: "John",
            loginUrl: expect.any(String),
        });

        expect(nodeMailMock.sendEmail).toHaveBeenCalledWith({
            to: "john@email.com",
            subject: "Senha Atualizada",
            html: "<h1>Senha alterada</h1>",
        });
    });
});