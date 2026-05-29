import { Request, Response, Router } from "express";
import { MagazineImpl } from "../repositories/MagazineImpl";
import { AppDataSource } from "../../infrastructure/database";
import { GetMagazinesUseCase } from "../../application/usecases/magazines/GetMagazinesUseCase";
import { GetMagazineByIdUseCase } from "../../application/usecases/magazines/GetMagazineByIdUseCase";
import { CreateMagazineUseCase } from "../../application/usecases/magazines/CreateMagazineUseCase";
import { UpdateMagazineUseCase } from "../../application/usecases/magazines/UpdateMagazineUseCase";
import { SuccessResponse } from "../../frameworks/types";
import {
  authMiddleware,
  optionalAuthMiddleware,
  roleMiddleware,
} from "../../frameworks/middleware";

export class MagazineController {
  public router: Router = Router();
  private magazineRepository: MagazineImpl;

  constructor() {
    this.magazineRepository = new MagazineImpl(AppDataSource);
    this.router.get("/", optionalAuthMiddleware, this.listHandler.bind(this));
    this.router.get("/:id", this.getByIdHandler.bind(this));
    this.router.post(
      "/",
      authMiddleware,
      roleMiddleware(["admin", "co-admin", "author"]),
      this.createHandler.bind(this)
    );
    this.router.patch(
      "/:id",
      authMiddleware,
      roleMiddleware(["admin", "co-admin", "author"]),
      this.updateHandler.bind(this)
    );
  }

  async listHandler(req: any, res: Response, next: any) {
    try {
      const usecase = new GetMagazinesUseCase(this.magazineRepository);
      const result = await usecase.execute(req.user?.id);
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async getByIdHandler(req: Request, res: Response, next: any) {
    try {
      const usecase = new GetMagazineByIdUseCase(this.magazineRepository);
      const result = await usecase.execute(req.params.id as string);
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async createHandler(req: any, res: Response, next: any) {
    try {
      const { title, content, coverImage } = req.body;
      const usecase = new CreateMagazineUseCase(this.magazineRepository);
      const result = await usecase.execute(
        title,
        content,
        coverImage,
        req.user.id
      );
      res.status(201).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }

  async updateHandler(req: Request, res: Response, next: any) {
    try {
      const { title, content, coverImage, status } = req.body;
      const usecase = new UpdateMagazineUseCase(this.magazineRepository);
      const result = await usecase.execute(req.params.id as string, {
        title,
        content,
        coverImage,
        status,
      });
      res.status(200).json({ ok: true, data: result } as SuccessResponse<
        typeof result
      >);
    } catch (error) {
      next(error);
    }
  }
}
