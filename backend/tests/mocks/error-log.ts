import { NextFunction, Request, Response } from "express";

export default function errorLogMock(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) {
    next(error);
}