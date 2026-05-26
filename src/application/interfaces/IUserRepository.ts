import { User, UserRole } from "../../adapters/models/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  findByRole(role: UserRole): Promise<User[]>;
}
