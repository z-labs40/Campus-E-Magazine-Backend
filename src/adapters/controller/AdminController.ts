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
import { CreateCoAdminUseCase } from "../../application/usecases/admin/CreateCoAdminUseCase";
import { ListCoAdminsUseCase } from "../../application/usecases/admin/ListCoAdminsUseCase";
import { UpdateCoAdminUseCase } from "../../application/usecases/admin/UpdateCoAdminUseCase";
import { ToggleCoAdminStatusUseCase } from "../../application/usecases/admin/ToggleCoAdminStatusUseCase";
import { DeleteCoAdminUseCase } from "../../application/usecases/admin/DeleteCoAdminUseCase";
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

    // Both Admin and Co-Admin can access these routes
    const adminAndCoAdmin = [authMiddleware, roleMiddleware(["admin", "co-admin"])];
    // Only Admin (super) can manage Co-Admins
    const adminOnly = [authMiddleware, roleMiddleware(["admin"])];

    this.router.get("/stats", ...adminAndCoAdmin, this.statsHandler.bind(this));
    this.router.get("/pending", ...adminAndCoAdmin, this.pendingHandler.bind(this));
    this.router.get("/suggestions/:editionId", ...adminAndCoAdmin, this.suggestionsHandler.bind(this));
    this.router.post("/merge/:editionId", ...adminAndCoAdmin, this.mergeHandler.bind(this));
    this.router.post("/reject/:editionId", ...adminAndCoAdmin, this.rejectHandler.bind(this));
    this.router.post("/create-admin", ...adminOnly, this.createAdminHandler.bind(this));

    // Co-Admin CRUD (admin-only management)
    this.router.get("/co-admins", ...adminOnly, this.listCoAdminsHandler.bind(this));
    this.router.post("/co-admins", ...adminOnly, this.createCoAdminHandler.bind(this));
    this.router.patch("/co-admins/:id", ...adminOnly, this.updateCoAdminHandler.bind(this));
    this.router.patch("/co-admins/:id/status", ...adminOnly, this.toggleCoAdminStatusHandler.bind(this));
    this.router.delete("/co-admins/:id", ...adminOnly, this.deleteCoAdminHandler.bind(this));
  }

  async statsHandler(_req: Request, res: Response, next: any) {
    try {
      const usecase = new GetAdminStatsUseCase(AppDataSource);
      const result = await usecase.execute();
      res.status(200).json({ ok: true, data: result } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async pendingHandler(_req: Request, res: Response, next: any) {
    try {
      const usecase = new GetPendingEditionsUseCase(this.magazineRepository, this.suggestionRepository);
      const result = await usecase.execute();
      res.status(200).json({ ok: true, data: result } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async suggestionsHandler(req: Request, res: Response, next: any) {
    try {
      const usecase = new GetSuggestionsByEditionUseCase(this.suggestionRepository, this.magazineRepository);
      const result = await usecase.execute(req.params.editionId as string);
      res.status(200).json({ ok: true, data: result } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async mergeHandler(req: Request, res: Response, next: any) {
    try {
      const { suggestionIds } = req.body;
      const usecase = new MergeEditionUseCase(this.magazineRepository, this.suggestionRepository, this.notificationRepository);
      const result = await usecase.execute(req.params.editionId as string, suggestionIds);
      res.status(200).json({ ok: true, data: result } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async rejectHandler(req: Request, res: Response, next: any) {
    try {
      const { suggestionIds } = req.body;
      const usecase = new RejectEditionSuggestionsUseCase(this.magazineRepository, this.suggestionRepository, this.notificationRepository);
      const result = await usecase.execute(req.params.editionId as string, suggestionIds);
      res.status(200).json({ ok: true, data: result } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async createAdminHandler(req: Request, res: Response, next: any) {
    try {
      const { email, password, name } = req.body;
      const usecase = new CreateAdminUseCase(this.userRepository);
      const result = await usecase.execute(email, password, name);
      res.status(201).json({ ok: true, data: result } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  // ── Co-Admin CRUD ────────────────────────────────────────────────────────────

  async listCoAdminsHandler(_req: Request, res: Response, next: any) {
    try {
      const usecase = new ListCoAdminsUseCase(this.userRepository);
      const result = await usecase.execute();
      res.status(200).json({ ok: true, data: result } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async createCoAdminHandler(req: Request, res: Response, next: any) {
    try {
      const { name, email, password } = req.body;
      const usecase = new CreateCoAdminUseCase(this.userRepository);
      const result = await usecase.execute(name, email, password);
      res.status(201).json({ ok: true, data: result, message: "Co-Admin created successfully" } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async updateCoAdminHandler(req: Request, res: Response, next: any) {
    try {
      const { name, email } = req.body;
      const usecase = new UpdateCoAdminUseCase(this.userRepository);
      const result = await usecase.execute(req.params.id as string, name, email);
      res.status(200).json({ ok: true, data: result, message: "Co-Admin updated successfully" } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async toggleCoAdminStatusHandler(req: Request, res: Response, next: any) {
    try {
      const usecase = new ToggleCoAdminStatusUseCase(this.userRepository);
      const result = await usecase.execute(req.params.id as string);
      res.status(200).json({ ok: true, data: result, message: `Co-Admin is now ${result.status}` } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async deleteCoAdminHandler(req: Request, res: Response, next: any) {
    try {
      const usecase = new DeleteCoAdminUseCase(this.userRepository);
      const result = await usecase.execute(req.params.id as string);
      res.status(200).json({ ok: true, data: result, message: result.message } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }
}
