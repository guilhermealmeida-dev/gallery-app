export class AppError extends Error {
    public code: string;
    public status: ErrorStatus;
    public details?: unknown;

    constructor(props: {
        code: string;
        message: string;
        status: ErrorStatus;
        details?: unknown;
    }) {
        super(props.message);

        this.name = "AppError";
        this.code = props.code;
        this.status = props.status;
        this.details = props.details;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export type AppErrorData = {
    code: string;
    message: string;
    status: ErrorStatus;
    details?: unknown;
};

export enum ErrorStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,

    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,


    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
}

export const ERRORS = {
    internalServerError: {
        code: "internal_error",
        message: "Erro interno no servidor",
        status: ErrorStatus.INTERNAL_SERVER_ERROR,
        details: null
    },

    bodyValidatorError: {
        code: "schema_validator",
        message: "Informe todos os campos corretamente.",
        status: ErrorStatus.BAD_REQUEST
    },

    riqueredImageError: {
        code: "riquered_image",
        message: "A imagem é obrigatória.",
        status: ErrorStatus.BAD_REQUEST
    },

    syntaxeJsonError: {
        code: "syntaxe_json",
        message: "Json Inválido",
        status: ErrorStatus.BAD_REQUEST,
        details: null
    },

    invalidImageTypeError: {
        code: "invalid_image_type",
        message: "A imagem deve estar no formato PNG ou JPEG",
        status: ErrorStatus.BAD_REQUEST,
        details: null
    },

    emailAlreadyExists: {
        code: "email_already_exists",
        message: "O email informado já está cadastrado.",
        status: ErrorStatus.BAD_REQUEST,
        details: null
    },

    invalidCredentials: {
        code: "invalid_credentials",
        message: "Credenciais inválidas. Verifique seu e-mail e senha.",
        status: ErrorStatus.UNAUTHORIZED,
        details: null
    },

    userNotVerified: {
        code: "user_not_verified",
        message: "Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada e confirme seu cadastro antes de fazer login.",
        status: ErrorStatus.FORBIDDEN,
        details: null
    },

    invalidToken:
    {
        code: "invalid_token",
        message: "Token inválido.",
        status: ErrorStatus.BAD_REQUEST,
        details: null
    },

    emailRequestLimitExceeded: {
        code: "email_request_limit_exceeded",
        message: "Limite de solicitações por hoje excedido. Tente novamente amanhã.",
        status: ErrorStatus.TOO_MANY_REQUESTS,
        details: null
    },

    unauthorized: {
        code: "unauthorized",
        message: "Autenticação necessária",
        status: ErrorStatus.UNAUTHORIZED,
        details: null
    },

    notfoundUser: {
        code: "not-found-user",
        message: "Usuário não encontrado",
        status: ErrorStatus.NOT_FOUND,
        details: null
    },

} as const satisfies Record<string, AppErrorData>;