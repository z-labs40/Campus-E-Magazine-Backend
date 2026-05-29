import { IMagazineRepository } from "../../interfaces/IMagazineRepository";

export class GetMagazinesUseCase {
  constructor(private magazineRepository: IMagazineRepository) {}

  async execute(userId?: string) {
    const magazines = await this.magazineRepository.findListForUser(userId);
    return magazines.map((m) => ({
      id: m.id,
      title: m.title,
      coverImage: m.coverImage,
      status: m.status,
      createdById: m.createdById,
      createdBy: m.createdBy
        ? { id: m.createdBy.id, name: m.createdBy.name }
        : undefined,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }
}
