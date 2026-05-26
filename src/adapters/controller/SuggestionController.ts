import { Response, Router } from "express";
import { AppDataSource } from "../../infrastructure/database";
import { SuggestionImpl } from "../repositories/SuggestionImpl";
import { MagazineImpl } from "../repositories/MagazineImpl";
import { UserImpl } from "../repositories/UserImpl";
import { NotificationImpl } from "../repositories/NotificationImpl";
import { CreateSuggestionUseCase } from "../../application/usecases/suggestions/CreateSuggestionUseCase";
import { SuccessResponse } from "../../frameworks/types";
import { authMiddleware } from "../../frameworks/middleware";

export class SuggestionController {
  public router: Router = Router();

  constructor() {
    const suggestionRepo = new SuggestionImpl(AppDataSource);
    const magazineRepo = new MagazineImpl(AppDataSource);
    const userRepo = new UserImpl(AppDataSource);
    const notificationRepo = new NotificationImpl(AppDataSource);

    this.router.post(
      "/",
      authMiddleware,
      async (req: any, res: Response, next) => {
        try {
          const { editionId, range, suggestion } = req.body;
          const usecase = new CreateSuggestionUseCase(
            suggestionRepo,
            magazineRepo,
            userRepo,
            notificationRepo
          );
          const result = await usecase.execute(
            req.user.id,
            editionId,
            range,
            suggestion
          );
          res.status(201).json({ ok: true, data: result } as SuccessResponse<
            typeof result
          >);
        } catch (error) {
          next(error);
        }
      }
    );
  }
}
