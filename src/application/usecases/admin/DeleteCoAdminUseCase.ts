import { IUserRepository } from "../../interfaces/IUserRepository";
import { NotFoundError } from "../../../shared/error";

export class DeleteCoAdminUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string) {
    const coAdmin = await this.userRepository.findById(id);
    if (!coAdmin || coAdmin.role !== "co-admin") {
      throw new NotFoundError("Co-Admin not found");
    }

    await this.userRepository.deleteById(id);

    return { success: true, message: "Co-Admin deleted successfully" };
  }
}
