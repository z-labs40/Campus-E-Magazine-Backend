import { Request } from "express";

export interface SuccessResponse<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface FailureResponse {
  ok: false;
  error: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
