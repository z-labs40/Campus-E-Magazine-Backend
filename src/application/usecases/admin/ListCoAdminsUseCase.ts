import { IUserRepository } from "../../interfaces/IUserRepository";

export class ListCoAdminsUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute() {
    const coAdmins = await this.userRepository.findAllCoAdmins();

    return coAdmins.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));
  }
}
