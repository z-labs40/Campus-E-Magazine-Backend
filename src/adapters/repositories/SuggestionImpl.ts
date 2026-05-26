import { DataSource, Repository } from "typeorm";
import { Suggestion, SuggestionStatus } from "../models/Suggestion";
import { ISuggestionRepository } from "../../application/interfaces/ISuggestionRepository";

export class SuggestionImpl implements ISuggestionRepository {
  private repository: Repository<Suggestion>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Suggestion);
  }

  async create(suggestion: Partial<Suggestion>): Promise<Suggestion> {
    const entity = this.repository.create(suggestion);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<Suggestion | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["user", "edition"],
    });
  }

  async findByEditionId(editionId: string): Promise<Suggestion[]> {
    return this.repository.find({
      where: { editionId },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  async findPendingByEditionId(editionId: string): Promise<Suggestion[]> {
    return this.repository.find({
      where: { editionId, status: "pending" },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  async updateStatus(id: string, status: SuggestionStatus): Promise<void> {
    await this.repository.update(id, { status });
  }

  async updateManyStatus(
    ids: string[],
    status: SuggestionStatus
  ): Promise<void> {
    if (ids.length === 0) return;
    await this.repository
      .createQueryBuilder()
      .update(Suggestion)
      .set({ status })
      .whereInIds(ids)
      .execute();
  }

  async countPendingByEditionId(editionId: string): Promise<number> {
    return this.repository.count({
      where: { editionId, status: "pending" },
    });
  }
}
