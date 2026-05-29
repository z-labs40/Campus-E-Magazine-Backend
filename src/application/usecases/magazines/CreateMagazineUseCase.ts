import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { BadRequestError } from "../../../shared/error";

export class CreateMagazineUseCase {
  constructor(private magazineRepository: IMagazineRepository) {}

  async execute(
    title: string,
    content: string,
    coverImage: string | undefined,
    createdById: string
  ) {
    if (!title?.trim() || !content?.trim()) {
      throw new BadRequestError("Title and content are required");
    }

    const magazine = await this.magazineRepository.create({
      title: title.trim(),
      content,
      coverImage,
      status: "draft",
      createdById,
    });

    return {
      id: magazine.id,
      title: magazine.title,
      coverImage: magazine.coverImage,
      status: magazine.status,
      createdAt: magazine.createdAt,
    };
  }
}
