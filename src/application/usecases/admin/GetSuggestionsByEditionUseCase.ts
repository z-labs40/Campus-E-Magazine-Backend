import { ISuggestionRepository } from "../../interfaces/ISuggestionRepository";
import { IMagazineRepository } from "../../interfaces/IMagazineRepository";
import { NotFoundError } from "../../../shared/error";

export class GetSuggestionsByEditionUseCase {
  constructor(
    private suggestionRepository: ISuggestionRepository,
    private magazineRepository: IMagazineRepository
  ) {}

  async execute(editionId: string) {
    const edition = await this.magazineRepository.findById(editionId);
    if (!edition) {
      throw new NotFoundError("Edition not found");
    }

    const suggestions =
      await this.suggestionRepository.findByEditionId(editionId);

    return {
      edition: {
        id: edition.id,
        title: edition.title,
        content: edition.content,
        status: edition.status,
      },
      suggestions: suggestions.map((s) => ({
        id: s.id,
        editionId: s.editionId,
        range: s.range,
        suggestion: s.suggestion,
        status: s.status,
        contributor: s.user?.name || "Unknown",
        contributorId: s.userId,
        createdAt: s.createdAt,
      })),
    };
  }
}
