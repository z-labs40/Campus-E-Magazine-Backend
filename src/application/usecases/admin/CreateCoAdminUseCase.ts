import bcrypt from "bcrypt";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { BadRequestError } from "../../../shared/error";

export class CreateCoAdminUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(name: string, email: string, password: string) {
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      throw new BadRequestError("Name, email, and password are required");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new BadRequestError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const coAdmin = await this.userRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "co-admin",
      status: "active",
    });

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
