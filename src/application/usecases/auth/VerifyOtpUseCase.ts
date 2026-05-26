import crypto from "crypto";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";

export class VerifyOtpUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, code: string, token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestError("Verification context is missing");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Email address not found");
    }

    try {
      // Decode and verify the stateless JWT token signature and expiration (3 minutes limit)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as {
        email: string;
        hashedOtp: string;
      };

      if (decoded.email.toLowerCase() !== email.toLowerCase()) {
        throw new BadRequestError("Invalid verification signature");
      }

      // Hash the user-submitted code to compare against the token payload
      const submittedHash = crypto.createHash("sha256").update(code).digest("hex");

      if (submittedHash !== decoded.hashedOtp) {
        throw new BadRequestError("Invalid verification code");
      }

      return {
        success: true,
        message: "Code verified successfully.",
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new BadRequestError("Verification code has expired");
      }
      throw new BadRequestError(error.message || "Invalid or tampered verification token");
    }
  }
}
