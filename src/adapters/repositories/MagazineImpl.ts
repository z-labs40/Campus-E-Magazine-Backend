import { DataSource, Repository } from "typeorm";
import { Magazine, MagazineStatus } from "../models/Magazine";
import { IMagazineRepository } from "../../application/interfaces/IMagazineRepository";

export class MagazineImpl implements IMagazineRepository {
  private repository: Repository<Magazine>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Magazine);
  }

  async findAll(): Promise<Magazine[]> {
    return this.repository.find({ order: { createdAt: "DESC" } });
  }

  async findPublished(): Promise<Magazine[]> {
    return this.repository.find({
      where: [{ status: "published" }, { status: "suggestions_pending" }],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Magazine | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByStatus(status: MagazineStatus): Promise<Magazine[]> {
    return this.repository.find({
      where: { status },
      order: { updatedAt: "DESC" },
    });
  }

  async create(magazine: Partial<Magazine>): Promise<Magazine> {
    const entity = this.repository.create(magazine);
    return this.repository.save(entity);
  }

  async update(id: string, data: Partial<Magazine>): Promise<Magazine> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error("Magazine not found after update");
    return updated;
  }
}
