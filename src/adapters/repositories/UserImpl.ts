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
}
