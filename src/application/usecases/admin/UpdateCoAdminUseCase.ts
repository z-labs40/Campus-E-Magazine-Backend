import { IUserRepository } from "../../interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";

export class UpdateCoAdminUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string, name: string, email: string) {
    if (!name?.trim() || !email?.trim()) {
      throw new BadRequestError("Name and email are required");
    }

    const coAdmin = await this.userRepository.findById(id);
    if (!coAdmin || coAdmin.role !== "co-admin") {
      throw new NotFoundError("Co-Admin not found");
    }

    // Check email uniqueness if changed
    if (email.toLowerCase() !== coAdmin.email) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing) {
        throw new BadRequestError("An account with this email already exists");
      }
    }

    const updated = await this.userRepository.update(id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
    };
  }
}
