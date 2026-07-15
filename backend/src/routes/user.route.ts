import { NextFunction, Request, Response, Router } from "express";
import { authGuard } from "../middlewares/auth-guard.ts";
import { getUserController } from "../controllers/user-controller.ts";

const router = Router();
router.use(authGuard);

router.get(
    "/me",
    (request: Request, response: Response, next: NextFunction) => getUserController(request, response, next)
);

export { router as userRouter };