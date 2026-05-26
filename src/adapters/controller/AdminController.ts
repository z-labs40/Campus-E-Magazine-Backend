import { Request, Response, Router } from "express";
import { AppDataSource } from "../../infrastructure/database";
import { MagazineImpl } from "../repositories/MagazineImpl";
import { SuggestionImpl } from "../repositories/SuggestionImpl";
import { UserImpl } from "../repositories/UserImpl";
import { NotificationImpl } from "../repositories/NotificationImpl";
import { GetPendingEditionsUseCase } from "../../application/usecases/admin/GetPendingEditionsUseCase";
import { GetSuggestionsByEditionUseCase } from "../../application/usecases/admin/GetSuggestionsByEditionUseCase";
import { MergeEditionUseCase } from "../../application/usecases/admin/MergeEditionUseCase";
import { RejectEditionSuggestionsUseCase } from "../../application/usecases/admin/RejectEditionSuggestionsUseCase";
import { GetAdminStatsUseCase } from "../../application/usecases/admin/GetAdminStatsUseCase";
import { CreateAdminUseCase } from "../../application/usecases/admin/CreateAdminUseCase";
import { SuccessResponse } from "../../frameworks/types";
import { authMiddleware, roleMiddleware } from "../../frameworks/middleware";

export class AdminController {
  public router: Router = Router();
  private magazineRepository: MagazineImpl;
  private suggestionRepository: SuggestionImpl;
  private userRepository: UserImpl;
  private notificationRepository: NotificationImpl;

  constructor() {
    this.magazineRepository = new MagazineImpl(AppDataSource);
    this.suggestionRepository = new SuggestionImpl(AppDataSource);
    this.userRepository = new UserImpl(AppDataSource);
    this.notificationRepository = new NotificationImpl(AppDataSource);

    const adminOnly = [authMiddleware, roleMiddleware(["admin"])];

    this.router.get("/stats", ...adminOnly, this.statsHandler.bind(this));
    this.router.get("/pending", ...adminOnly, this.pendingHandler.bind(this));
    this.router.get(
      "/suggestions/:editionId",
      ...adminOnly,
      this.suggestionsHandler.bind(this)
    );
    this.router.post(
      "/merge/:editionId",
      ...adminOnly,
      this.mergeHandler.bind(this)
    );
    this.router.post(
      "/reject/:editionId",
      ...adminOnly,
      this.rejectHandler.bind(this)
    );
    this.router.post(
      "/create-admin",
      ...adminOnly,
      this.createAdminHandler.bind(this)
    );
  }

  async statsHandler(_req: Request, res: Response, next: any) {
    try {
      const usecase = new GetAdminStatsUseCase(AppDataSource);
      const result = await usecase.execute();
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async pendingHandler(_req: Request, res: Response, next: any) {
    try {
      const usecase = new GetPendingEditionsUseCase(
        this.magazineRepository,
        this.suggestionRepository
      );
      const result = await usecase.execute();
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async suggestionsHandler(req: Request, res: Response, next: any) {
    try {
      const usecase = new GetSuggestionsByEditionUseCase(
        this.suggestionRepository,
        this.magazineRepository
      );
      const result = await usecase.execute(req.params.editionId as string);
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async mergeHandler(req: Request, res: Response, next: any) {
    try {
      const { suggestionIds } = req.body;
      const usecase = new MergeEditionUseCase(
        this.magazineRepository,
        this.suggestionRepository,
        this.notificationRepository
      );
      const result = await usecase.execute(
        req.params.editionId as string,
        suggestionIds
      );
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async rejectHandler(req: Request, res: Response, next: any) {
    try {
      const { suggestionIds } = req.body;
      const usecase = new RejectEditionSuggestionsUseCase(
        this.magazineRepository,
        this.suggestionRepository,
        this.notificationRepository
      );
      const result = await usecase.execute(
        req.params.editionId as string,
        suggestionIds
      );
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async createAdminHandler(req: Request, res: Response, next: any) {
    try {
      const { email, password, name } = req.body;
      const usecase = new CreateAdminUseCase(this.userRepository);
      const result = await usecase.execute(email, password, name);
      res.status(201).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }
}
