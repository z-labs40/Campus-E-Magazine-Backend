import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { UserRole } from "../../../adapters/models/User";
import { config } from "../../../config";
import { BadRequestError } from "../../../shared/error";

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    email: string,
    password: string,
    name: string,
    role: UserRole = "reader"
  ) {
    if (!email || !password || !name) {
      throw new BadRequestError("Email, password, and name are required");
    }

    if (role === "admin") {
      throw new BadRequestError("Cannot self-register as admin");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new BadRequestError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role === "author" ? "author" : "reader",
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
