import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import {
  UnauthorizedError,
  ForbiddenError,
  AppError,
} from "../shared/error";
import { Logger } from "../shared/logger";
import { FailureResponse } from "./types";

export const authMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("No token provided"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: any, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Access denied"));
    }
    next();
  };
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err.name === "QueryFailedError" && err.code === "23505") {
    const detail = err.detail || "";
    let message = "A record with this value already exists.";
    if (detail.includes("email")) {
      message = "A user with this email already exists.";
    }
    return res.status(409).json({ ok: false, error: message } as FailureResponse);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  if (statusCode === 500) {
    Logger.error(`[ERROR] ${err.stack}`);
  }

  return res.status(statusCode).json({ ok: false, error: message } as FailureResponse);
};

export const loggerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  Logger.info(`${req.method} ${req.url}`);
  next();
};
