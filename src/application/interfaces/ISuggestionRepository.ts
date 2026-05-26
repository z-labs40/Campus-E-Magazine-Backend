import { Suggestion, SuggestionStatus } from "../../adapters/models/Suggestion";

export interface ISuggestionRepository {
  create(suggestion: Partial<Suggestion>): Promise<Suggestion>;
  findById(id: string): Promise<Suggestion | null>;
  findByEditionId(editionId: string): Promise<Suggestion[]>;
  findPendingByEditionId(editionId: string): Promise<Suggestion[]>;
  updateStatus(id: string, status: SuggestionStatus): Promise<void>;
  updateManyStatus(ids: string[], status: SuggestionStatus): Promise<void>;
  countPendingByEditionId(editionId: string): Promise<number>;
}
