import { IMagazineRepository } from "../../interfaces/IMagazineRepository";

export class GetMagazinesUseCase {
  constructor(private magazineRepository: IMagazineRepository) {}

  async execute() {
    const magazines = await this.magazineRepository.findPublished();
    return magazines.map((m) => ({
      id: m.id,
      title: m.title,
      coverImage: m.coverImage,
      status: m.status,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }
}
