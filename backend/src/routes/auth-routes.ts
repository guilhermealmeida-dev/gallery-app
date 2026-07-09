import { type Request, type Response, Router, type NextFunction } from "express";
import { requestBodyValidator } from "../middlewares/request-body-validator.ts";
import { authLoginUserSchema, authRegisterUserSchema } from "../schemas/auth-schema.ts";
import { confirmEmailController, loginController, registerUserController } from "../controllers/auth-controller.ts";
import { upload } from "../utils/upload.ts";
import { validateSingleImage } from "../middlewares/validate-single-image.ts";

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

export { router as authRoute };