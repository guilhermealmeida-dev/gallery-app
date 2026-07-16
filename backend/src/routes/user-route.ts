import { NextFunction, Request, Response, Router } from "express";
import { authGuard } from "../middlewares/auth-guard.ts";
import { getUserController, updateUserAvatarController, updateUserController } from "../controllers/user-controller.ts";
import { requestBodyValidator } from "../middlewares/request-body-validator.ts";
import { userUpdateSchema } from "../schemas/user.schema.ts";
import { upload } from "../utils/upload.ts";
import { validateSingleImage } from "../middlewares/validate-single-image.ts";

const router = Router();
router.use(authGuard);

router.get(
    "/me",
    (request: Request, response: Response, next: NextFunction) => getUserController(request, response, next)
);

router.put(
    "/me",
    requestBodyValidator(userUpdateSchema),
    (request: Request, response: Response, next: NextFunction) => updateUserController(request, response, next)
);

router.put(
    "/me/avatar",
    upload.single("avatar"),
    validateSingleImage(true),
    (request: Request, response: Response, next: NextFunction) => updateUserAvatarController(request, response, next)
);

export { router as userRouter };