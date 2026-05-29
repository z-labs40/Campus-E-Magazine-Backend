import { DataSource } from "typeorm";
import { Magazine } from "../../../adapters/models/Magazine";
import { Suggestion } from "../../../adapters/models/Suggestion";
import { User } from "../../../adapters/models/User";

export class GetAdminStatsUseCase {
  constructor(private dataSource: DataSource) {}

  async execute() {
    const magazineRepo = this.dataSource.getRepository(Magazine);
    const suggestionRepo = this.dataSource.getRepository(Suggestion);
    const userRepo = this.dataSource.getRepository(User);

    const [
      totalMagazines,
      pendingEditions,
      pendingSuggestions,
      totalUsers,
      totalAdmins,
    ] = await Promise.all([
      magazineRepo.count(),
      magazineRepo.count({
        where: [{ status: "suggestions_pending" }, { status: "pending_review" }],
      }),
      suggestionRepo.count({ where: { status: "pending" } }),
      userRepo.count(),
      userRepo.count({ where: { role: "admin" } }),
    ]);

    return {
      totalMagazines,
      pendingEditions,
      pendingSuggestions,
      totalUsers,
      totalAdmins,
    };
  }
}
