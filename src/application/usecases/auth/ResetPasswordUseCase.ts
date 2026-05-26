import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";

export class ResetPasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    email: string,
    code: string,
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long");
    }

    if (!token) {
      throw new BadRequestError("Verification context is missing");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Email address not found");
    }

    try {
      // Decode and verify the stateless JWT token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as {
        email: string;
        hashedOtp: string;
      };

      if (decoded.email.toLowerCase() !== email.toLowerCase()) {
        throw new BadRequestError("Invalid verification signature");
      }

      // Hash the user-submitted code to ensure it matches the authorized hash inside the token
      const submittedHash = crypto.createHash("sha256").update(code).digest("hex");

      if (submittedHash !== decoded.hashedOtp) {
        throw new BadRequestError("Invalid verification code");
      }

      // Hash the new password securely
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Save the new password (otpCode and otpExpiresAt remain NULL in the DB!)
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        otpCode: null,
        otpExpiresAt: null,
      });

      return {
        success: true,
        message: "Password reset successfully. Please sign in with your new password.",
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new BadRequestError("Verification token has expired");
      }
      throw new BadRequestError(error.message || "Invalid or tampered verification token");
    }
  }
}
