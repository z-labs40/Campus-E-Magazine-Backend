import { Request, Response, Router } from "express";
import { MagazineImpl } from "../repositories/MagazineImpl";
import { AppDataSource } from "../../infrastructure/database";
import { GetMagazinesUseCase } from "../../application/usecases/magazines/GetMagazinesUseCase";
import { GetMagazineByIdUseCase } from "../../application/usecases/magazines/GetMagazineByIdUseCase";
import { CreateMagazineUseCase } from "../../application/usecases/magazines/CreateMagazineUseCase";
import { SuccessResponse } from "../../frameworks/types";
import { authMiddleware, roleMiddleware } from "../../frameworks/middleware";

export class MagazineController {
  public router: Router = Router();
  private magazineRepository: MagazineImpl;

  constructor() {
    this.magazineRepository = new MagazineImpl(AppDataSource);
    this.router.get("/", this.listHandler.bind(this));
    this.router.get("/:id", this.getByIdHandler.bind(this));
    this.router.post(
      "/",
      authMiddleware,
      roleMiddleware(["admin"]),
      this.createHandler.bind(this)
    );
  }

  async listHandler(_req: Request, res: Response, next: any) {
    try {
      const usecase = new GetMagazinesUseCase(this.magazineRepository);
      const result = await usecase.execute();
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
}
