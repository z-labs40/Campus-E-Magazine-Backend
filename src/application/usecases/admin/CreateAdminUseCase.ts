import bcrypt from "bcrypt";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { BadRequestError } from "../../../shared/error";

export class CreateAdminUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string, name: string) {
    if (!email || !password || !name) {
      throw new BadRequestError("Email, password, and name are required");
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
      role: "admin",
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
