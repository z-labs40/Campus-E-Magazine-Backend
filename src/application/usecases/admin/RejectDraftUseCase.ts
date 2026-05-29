import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { INotificationRepository } from "../../interfaces/INotificationRepository";
import { NotFoundError, BadRequestError } from "../../../shared/error";
import { emitToUser } from "../../../infrastructure/socket";

export class RejectDraftUseCase {
  constructor(
    private magazineRepository: IMagazineRepository,
    private notificationRepository: INotificationRepository
  ) {}

  async execute(editionId: string, reason: string) {
    const edition = await this.magazineRepository.findById(editionId);
    if (!edition) {
      throw new NotFoundError("Edition not found");
    }

    if (edition.status === "published") {
      throw new BadRequestError("Cannot reject a published edition");
    }

    // Set it back to draft
    const updated = await this.magazineRepository.update(editionId, { status: "draft" });

    // Notify author if createdById exists
    if (edition.createdById) {
      await this.notificationRepository.create({
        userId: edition.createdById,
        message: `Your draft "${edition.title}" was rejected. Reason: ${reason}`,
        type: "draft-rejected",
        editionId,
      });

      emitToUser(edition.createdById, "draft-rejected", {
        editionId,
        reason,
      });
    }

    return { rejected: true, editionId: updated.id, status: updated.status };
  }
}
