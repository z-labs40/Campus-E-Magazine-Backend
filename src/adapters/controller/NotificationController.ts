import { Response, Router } from "express";
import { AppDataSource } from "../../infrastructure/database";
import { NotificationImpl } from "../repositories/NotificationImpl";
import { GetNotificationsUseCase } from "../../application/usecases/notifications/GetNotificationsUseCase";
import { SuccessResponse } from "../../frameworks/types";
import { authMiddleware } from "../../frameworks/middleware";

export class NotificationController {
  public router: Router = Router();

  constructor() {
    const notificationRepo = new NotificationImpl(AppDataSource);

    this.router.get("/", authMiddleware, async (req: any, res: Response, next) => {
      try {
        const usecase = new GetNotificationsUseCase(notificationRepo);
        const result = await usecase.execute(req.user.id);
        res.status(200).json({ ok: true, data: result } as SuccessResponse<
          typeof result
        >);
      } catch (error) {
        next(error);
      }
    });
  }
}
