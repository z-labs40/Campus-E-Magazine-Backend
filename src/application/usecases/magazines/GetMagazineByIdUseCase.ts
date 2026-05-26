import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { NotFoundError } from "../../../shared/error";

export class GetMagazineByIdUseCase {
  constructor(private magazineRepository: IMagazineRepository) {}

  async execute(id: string) {
    const magazine = await this.magazineRepository.findById(id);
    if (!magazine) {
      throw new NotFoundError("Magazine edition not found");
    }

    return {
      id: magazine.id,
      title: magazine.title,
      coverImage: magazine.coverImage,
      content: magazine.content,
      status: magazine.status,
      createdAt: magazine.createdAt,
      updatedAt: magazine.updatedAt,
    };
  }
}
