import { IUserRepository } from "../../interfaces/IUserRepository";
import { NotFoundError } from "../../../shared/error";

export class ToggleCoAdminStatusUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string) {
    const coAdmin = await this.userRepository.findById(id);
    if (!coAdmin || coAdmin.role !== "co-admin") {
      throw new NotFoundError("Co-Admin not found");
    }

    const newStatus = coAdmin.status === "active" ? "inactive" : "active";

    const updated = await this.userRepository.update(id, { status: newStatus });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
    };
  }
}
