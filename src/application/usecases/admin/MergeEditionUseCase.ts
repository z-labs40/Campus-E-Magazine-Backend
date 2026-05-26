import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { ISuggestionRepository } from "../../interfaces/ISuggestionRepository";
import { INotificationRepository } from "../../interfaces/INotificationRepository";
import { NotFoundError, BadRequestError } from "../../../shared/error";
import { applySuggestionToContent } from "../../../shared/mergeContent";
import {
  emitBroadcast,
  emitToUser,
} from "../../../infrastructure/socket";

export class MergeEditionUseCase {
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
      throw new BadRequestError("No pending suggestions to merge");
    }

    let content = edition.content;
    const sorted = [...pending].sort((a, b) => b.range.start - a.range.start);

    for (const item of sorted) {
      content = applySuggestionToContent(
        content,
        item.range,
        item.suggestion
      );
    }

    const ids = pending.map((s) => s.id);
    await this.suggestionRepository.updateManyStatus(ids, "accepted");

    const remaining =
      await this.suggestionRepository.countPendingByEditionId(editionId);

    const newStatus = remaining > 0 ? "suggestions_pending" : "published";

    const updated = await this.magazineRepository.update(editionId, {
      content,
      status: newStatus,
    });

    for (const item of pending) {
      await this.notificationRepository.create({
        userId: item.userId,
        message: `Your suggestion on "${edition.title}" was accepted`,
        type: "suggestion-accepted",
        editionId,
      });

      emitToUser(item.userId, "suggestion-accepted", {
        editionId,
        suggestionId: item.id,
      });
    }

    emitBroadcast("magazine-updated", {
      editionId,
      title: updated.title,
      status: updated.status,
    });

    return { merged: true, editionId, acceptedCount: ids.length };
  }
}
