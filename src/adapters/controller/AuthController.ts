import { Request, Response, Router } from "express";
import { UserImpl } from "../repositories/UserImpl";
import { AppDataSource } from "../../infrastructure/database";
import { LoginUseCase } from "../../application/usecases/auth/LoginUseCase";
import { RegisterUseCase } from "../../application/usecases/auth/RegisterUseCase";
import { ForgotPasswordUseCase } from "../../application/usecases/auth/ForgotPasswordUseCase";
import { VerifyOtpUseCase } from "../../application/usecases/auth/VerifyOtpUseCase";
import { ResetPasswordUseCase } from "../../application/usecases/auth/ResetPasswordUseCase";
import { BecomeAuthorUseCase } from "../../application/usecases/auth/BecomeAuthorUseCase";
import { ChangePasswordUseCase } from "../../application/usecases/auth/ChangePasswordUseCase";
import { SuccessResponse } from "../../frameworks/types";
import { UserRole } from "../models/User";
import { authMiddleware } from "../../frameworks/middleware";

export class AuthController {
  public router: Router = Router();
  private userRepository: UserImpl;

  constructor() {
    this.userRepository = new UserImpl(AppDataSource);
    this.router.post("/login", this.loginHandler.bind(this));
    this.router.post("/register", this.registerHandler.bind(this));
    this.router.post("/forgot-password", this.forgotPasswordHandler.bind(this));
    this.router.post("/verify-otp", this.verifyOtpHandler.bind(this));
    this.router.post("/reset-password", this.resetPasswordHandler.bind(this));
    this.router.patch("/become-author", authMiddleware, this.becomeAuthorHandler.bind(this));
    this.router.patch("/change-password", authMiddleware, this.changePasswordHandler.bind(this));
  }

  async loginHandler(req: Request, res: Response, next: any) {
    try {
      const { email, password } = req.body;
      const usecase = new LoginUseCase(this.userRepository);
      const result = await usecase.execute(email, password);

      res.status(200).json({
        ok: true,
        data: result,
        message: "Login successful",
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async registerHandler(req: Request, res: Response, next: any) {
    try {
      const { email, password, name, role } = req.body;
      const usecase = new RegisterUseCase(this.userRepository);
      const result = await usecase.execute(
        email,
        password,
        name || email.split("@")[0],
        (role as UserRole) || "reader"
      );

      res.status(201).json({
        ok: true,
        data: result,
        message: "Registration successful",
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async forgotPasswordHandler(req: Request, res: Response, next: any) {
    try {
      const { email } = req.body;
      const usecase = new ForgotPasswordUseCase(this.userRepository);
      const result = await usecase.execute(email);

      res.status(200).json({
        ok: true,
        data: result,
        message: result.message,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtpHandler(req: Request, res: Response, next: any) {
    try {
      const { email, code, token } = req.body;
      const usecase = new VerifyOtpUseCase(this.userRepository);
      const result = await usecase.execute(email, code, token);

      res.status(200).json({
        ok: true,
        data: result,
        message: result.message,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async resetPasswordHandler(req: Request, res: Response, next: any) {
    try {
      const { email, code, token, newPassword } = req.body;
      const usecase = new ResetPasswordUseCase(this.userRepository);
      const result = await usecase.execute(email, code, token, newPassword);

      res.status(200).json({
        ok: true,
        data: result,
        message: result.message,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async becomeAuthorHandler(req: any, res: Response, next: any) {
    try {
      const usecase = new BecomeAuthorUseCase(this.userRepository);
      const result = await usecase.execute(req.user.id);
      res.status(200).json({
        ok: true,
        data: result,
        message: "Role upgraded to Author",
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async changePasswordHandler(req: any, res: Response, next: any) {
    try {
      const { currentPassword, newPassword } = req.body;
      const usecase = new ChangePasswordUseCase(this.userRepository);
      const result = await usecase.execute(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        ok: true,
        data: result,
        message: result.message,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }
}
