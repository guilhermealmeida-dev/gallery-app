export class AppError {
    constructor(
        public code: string,
        public message: string,
        public status: ErrorStatus,
        public details?: unknown
    ) {}
}

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

    syntaxeJsonError: {
        code: "syntaxe_json",
        message: "Json Inválido",
        status: ErrorStatus.BAD_REQUEST,
        details: null
    },

} as const satisfies Record<string, AppError>;