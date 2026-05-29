import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { NotFoundError } from "../../../shared/error";

export class UpdateMagazineUseCase {
  constructor(private magazineRepository: IMagazineRepository) {}

  async execute(
    id: string,
    data: {
      title?: string;
      content?: string;
      coverImage?: string;
      status?: "draft" | "pending_review" | "published" | "suggestions_pending";
    }
  ) {
    const existing = await this.magazineRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Magazine not found");
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.magazineRepository.update(id, updateData);
  }
}
