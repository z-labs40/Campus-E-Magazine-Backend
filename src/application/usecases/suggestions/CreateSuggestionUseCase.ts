import { ISuggestionRepository } from "../../interfaces/ISuggestionRepository";
import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { INotificationRepository } from "../../interfaces/INotificationRepository";
import { TextRange } from "../../../adapters/models/Suggestion";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import { emitToAdmins } from "../../../infrastructure/socket";

export class CreateSuggestionUseCase {
  constructor(
    private suggestionRepository: ISuggestionRepository,
    private magazineRepository: IMagazineRepository,
    private userRepository: IUserRepository,
    private notificationRepository: INotificationRepository
  ) {}

  async execute(
    userId: string,
    editionId: string,
    range: TextRange,
    suggestion: string
  ) {
    if (!editionId || !range || !suggestion?.trim()) {
      throw new BadRequestError("editionId, range, and suggestion are required");
    }

    const edition = await this.magazineRepository.findById(editionId);
    if (!edition) {
      throw new NotFoundError("Magazine edition not found");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const created = await this.suggestionRepository.create({
      editionId,
      userId,
      range,
      suggestion: suggestion.trim(),
      status: "pending",
    });

    await this.magazineRepository.update(editionId, {
      status: "suggestions_pending",
    });

    const admins = await this.userRepository.findByRole("admin");
    const message = `${user.name} suggested an edit on "${edition.title}"`;

    for (const admin of admins) {
      const notification = await this.notificationRepository.create({
        userId: admin.id,
        message,
        type: "suggestion",
        editionId,
      });

      emitToAdmins("notification", {
        id: notification.id,
        message: notification.message,
        type: notification.type,
        editionId,
        createdAt: notification.createdAt,
      });
    }

    emitToAdmins("suggestion-created", {
      editionId,
      suggestionId: created.id,
    });

    return { id: created.id };
  }
}
