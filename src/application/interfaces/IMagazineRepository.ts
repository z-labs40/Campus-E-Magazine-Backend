import { Magazine, MagazineStatus } from "../../adapters/models/Magazine";

export interface IMagazineRepository {
  findAll(): Promise<Magazine[]>;
  findPublished(): Promise<Magazine[]>;
  findById(id: string): Promise<Magazine | null>;
  findByStatus(status: MagazineStatus): Promise<Magazine[]>;
  create(magazine: Partial<Magazine>): Promise<Magazine>;
  update(id: string, data: Partial<Magazine>): Promise<Magazine>;
}
