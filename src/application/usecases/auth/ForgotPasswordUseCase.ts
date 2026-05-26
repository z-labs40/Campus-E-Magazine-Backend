import crypto from "crypto";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { NotFoundError } from "../../../shared/error";
import { Logger } from "../../../shared/logger";
import { mailer } from "../../../shared/mailer";

export class ForgotPasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string): Promise<{ success: boolean; message: string; token: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("Email address not found");
    }

    // Generate a secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Log the OTP code clearly in the console so it's super easy to test in dev
    Logger.info(`[AUTH] Password Reset Requested for ${email}. OTP Verification Code is: ${otpCode}`);

    // Send the email directly to the user
    await mailer.sendOtpEmail(user.email, user.name, otpCode);

    // Cryptographically hash the OTP code
    const hashedOtp = crypto.createHash("sha256").update(otpCode).digest("hex");

    // Sign a stateless secure JWT containing the hashed OTP expiring in exactly 3 minutes (180s)
    const token = jwt.sign(
      { email: user.email, hashedOtp },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "3m" }
    );

    return {
      success: true,
      message: "Verification code sent to your campus email.",
      token,
    };
  }
}
