import { type Request, type Response, Router, type NextFunction } from "express";
import { requestBodyValidator } from "../middlewares/request-body-validator.ts";
import { registerUserSchema } from "../schemas/register-user-schema.ts";
import { registerUserController } from "../controllers/auth-controller.ts";
import { upload } from "../utils/upload.ts";
import { validateSingleImage } from "../middlewares/validate-single-image.ts";

const router = Router();

router.post(
    "/register",
    upload.single("avatar"),
    requestBodyValidator(registerUserSchema),
    validateSingleImage(),
    (request: Request, response: Response, next: NextFunction) => registerUserController(request, response, next)
);

export { router as authRoute };