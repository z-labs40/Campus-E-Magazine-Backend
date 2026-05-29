import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { ISuggestionRepository } from "../../interfaces/ISuggestionRepository";

export class GetPendingEditionsUseCase {
  constructor(
    private magazineRepository: IMagazineRepository,
    private suggestionRepository: ISuggestionRepository
  ) {}

  async execute() {
    const [pendingReview, suggestionsPending] = await Promise.all([
      this.magazineRepository.findByStatus("pending_review"),
      this.magazineRepository.findByStatus("suggestions_pending"),
    ]);
    const editions = [...pendingReview, ...suggestionsPending];

    return Promise.all(
      editions.map(async (edition) => {
        const pendingCount =
          await this.suggestionRepository.countPendingByEditionId(edition.id);
        return {
          id: edition.id,
          title: edition.title,
          coverImage: edition.coverImage,
          status: edition.status,
          pendingSuggestions: pendingCount,
          updatedAt: edition.updatedAt,
        };
      })
    );
  }
}
