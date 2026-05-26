import { User, UserRole } from "../../adapters/models/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  findByRole(role: UserRole): Promise<User[]>;
  findAllCoAdmins(): Promise<User[]>;
  deleteById(id: string): Promise<void>;
  update(id: string, data: Partial<User>): Promise<User>;
}
