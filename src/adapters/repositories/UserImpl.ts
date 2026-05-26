import { DataSource, Repository } from "typeorm";
import { User, UserRole } from "../models/User";
import { IUserRepository } from "../../application/interfaces/IUserRepository";

export class UserImpl implements IUserRepository {
  private repository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = this.repository.create(user);
    return this.repository.save(entity);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.repository.find({ where: { role } });
  }

  async findAllCoAdmins(): Promise<User[]> {
    return this.repository.find({ where: { role: "co-admin" }, order: { createdAt: "DESC" } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error("User not found after update");
    return updated;
  }
}
