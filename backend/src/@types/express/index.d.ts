import "express";
import { AuthPayload } from "../../types/auth.ts";

declare module "express-serve-static-core" {
    interface Request {
        user: AuthPayload
    }
}