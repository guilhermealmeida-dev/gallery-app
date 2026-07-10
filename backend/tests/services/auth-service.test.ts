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

const actualUserRepository = await import(
    "../../src/repositories/user-repository.ts"
);

const userRepositoryMock = {
    ...actualUserRepository,

    updateUserRepository:
        jest.fn<typeof actualUserRepository.updateUserRepository>(),
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

const { confirmEmailService } = await import(
    "../../src/services/auth-service.ts"
);


beforeEach(() => {
    jest.clearAllMocks();

    welcomeTemplateMock.welcomeTemplate.mockReturnValue(
        "<h1>Bem-vindo!</h1>"
    );
});

afterAll(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.clearAllMocks();

    welcomeTemplateMock.welcomeTemplate.mockReturnValue("<h1>Bem-vindo!</h1>");
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
