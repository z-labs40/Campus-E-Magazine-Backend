import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { ISuggestionRepository } from "../../interfaces/ISuggestionRepository";
import { INotificationRepository } from "../../interfaces/INotificationRepository";
import { NotFoundError, BadRequestError } from "../../../shared/error";
import { emitToUser } from "../../../infrastructure/socket";

export class RejectEditionSuggestionsUseCase {
  constructor(
    private magazineRepository: IMagazineRepository,
    private suggestionRepository: ISuggestionRepository,
    private notificationRepository: INotificationRepository
  ) {}

  async execute(editionId: string, suggestionIds?: string[]) {
    const edition = await this.magazineRepository.findById(editionId);
    if (!edition) {
      throw new NotFoundError("Edition not found");
    }

    let pending = await this.suggestionRepository.findPendingByEditionId(
      editionId
    );

    if (suggestionIds?.length) {
      pending = pending.filter((s) => suggestionIds.includes(s.id));
    }

    if (pending.length === 0) {
      throw new BadRequestError("No pending suggestions to reject");
    }

    const ids = pending.map((s) => s.id);
    await this.suggestionRepository.updateManyStatus(ids, "rejected");

    const remaining =
      await this.suggestionRepository.countPendingByEditionId(editionId);

    if (remaining === 0) {
      await this.magazineRepository.update(editionId, { status: "published" });
    }

    for (const item of pending) {
      await this.notificationRepository.create({
        userId: item.userId,
        message: `Your suggestion on "${edition.title}" was rejected`,
        type: "suggestion-rejected",
        editionId,
      });

      emitToUser(item.userId, "suggestion-rejected", {
        editionId,
        suggestionId: item.id,
      });
    }

    return { rejected: true, editionId, rejectedCount: ids.length };
  }
}
