import bcrypt from "bcrypt";
import crypto from "crypto";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { BadRequestError } from "../../../shared/error";
import { mailer } from "../../../shared/mailer";

function generateTemporaryPassword(length = 12): string {
  // Avoid ambiguous characters to make it easier to communicate.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

export class CreateCoAdminUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(name: string, email: string) {
    if (!name?.trim() || !email?.trim()) {
      throw new BadRequestError("Name and email are required");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new BadRequestError("An account with this email already exists");
    }

    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const coAdmin = await this.userRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "co-admin",
      status: "active",
    });

    // Best-effort email delivery. If SMTP isn't configured, the mailer logs to console.
    await mailer.sendWelcomeEmail(coAdmin.email, coAdmin.name, tempPassword);

    return {
      id: coAdmin.id,
      name: coAdmin.name,
      email: coAdmin.email,
      role: coAdmin.role,
      status: coAdmin.status,
      createdAt: coAdmin.createdAt,
    };
  }
}
