import { type Request, type Response, Router, type NextFunction } from "express";
import { requestBodyValidator } from "../middlewares/request-body-validator.ts";
import { authEmailUserSchema, authLoginUserSchema, authRegisterUserSchema, authResetPasswordSchema } from "../schemas/auth-schema.ts";
import { confirmEmailController, resetPasswordController, loginController, registerUserController, sendEmailForgotPasswordController, validateTokenController } from "../controllers/auth-controller.ts";
import { upload } from "../utils/upload.ts";
import { validateSingleImage } from "../middlewares/validate-single-image.ts";
import { authGuard } from "../middlewares/auth-guard.ts";

const router = Router();

router.post(
    "/register",
    upload.single("avatar"),
    requestBodyValidator(authRegisterUserSchema),
    validateSingleImage(),
    (request: Request, response: Response, next: NextFunction) => registerUserController(request, response, next)
);

router.post(
    "/login",
    requestBodyValidator(authLoginUserSchema),
    (request: Request, response: Response, next: NextFunction) => loginController(request, response, next)
);

router.get(
    "/confirm-email",
    (request: Request, response: Response, next: NextFunction) => confirmEmailController(request, response, next)
);

router.post(
    "/send-forgot-password",
    requestBodyValidator(authEmailUserSchema),
    (request: Request, response: Response, next: NextFunction) => sendEmailForgotPasswordController(request, response, next)
);

router.get(
    "/reset-password/validate",
    (request: Request, response: Response, next: NextFunction) => validateTokenController(request, response, next)
);

router.post(
    "/reset-password",
    requestBodyValidator(authResetPasswordSchema),
    (request: Request, response: Response, next: NextFunction) => resetPasswordController(request, response, next)
);

export { router as authRoute };