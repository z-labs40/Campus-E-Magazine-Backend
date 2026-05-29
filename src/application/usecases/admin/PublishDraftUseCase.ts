import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { NotFoundError, BadRequestError } from "../../../shared/error";

export class PublishDraftUseCase {
  constructor(private magazineRepository: IMagazineRepository) {}

  async execute(editionId: string) {
    const edition = await this.magazineRepository.findById(editionId);
    if (!edition) {
      throw new NotFoundError("Edition not found");
    }

    if (edition.status === "published") {
      throw new BadRequestError("Edition is already published");
    }

    const updated = await this.magazineRepository.update(editionId, { status: "published" });
    return { published: true, editionId: updated.id, status: updated.status };
  }
}
