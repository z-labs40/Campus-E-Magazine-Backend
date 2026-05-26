import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { ISuggestionRepository } from "../../interfaces/ISuggestionRepository";

export class GetPendingEditionsUseCase {
  constructor(
    private magazineRepository: IMagazineRepository,
    private suggestionRepository: ISuggestionRepository
  ) {}

  async execute() {
    const editions = await this.magazineRepository.findByStatus(
      "suggestions_pending"
    );

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
