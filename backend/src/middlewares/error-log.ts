import type { Request, Response, NextFunction } from "express";

export function errorLog(error: any, request: Request, response: Response, next: NextFunction) {
    console.log("----------------- Server Error -----------------");
    console.log(error);
    console.log("------------------------------------------------");
    next(error);
}