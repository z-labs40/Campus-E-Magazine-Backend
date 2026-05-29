import { Express } from "express";
import { AuthController } from "../adapters/controller/AuthController";
import { MagazineController } from "../adapters/controller/MagazineController";
import { SuggestionController } from "../adapters/controller/SuggestionController";
import { AdminController } from "../adapters/controller/AdminController";
import { NotificationController } from "../adapters/controller/NotificationController";
import { UploadController } from "../adapters/controller/UploadController";
import { Logger } from "../shared/logger";

export default (app: Express) => {
  const authController = new AuthController();
  const magazineController = new MagazineController();
  const suggestionController = new SuggestionController();
  const adminController = new AdminController();
  const notificationController = new NotificationController();
  const uploadController = new UploadController();

  app.use("/api/auth", authController.router);
  app.use("/api/magazines", magazineController.router);
  app.use("/api/suggestions", suggestionController.router);
  app.use("/api/admin", adminController.router);
  app.use("/api/notifications", notificationController.router);
  app.use("/api/uploads", uploadController.router);

  Logger.info("Routes registered successfully");
};
