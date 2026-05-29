import { Request, Response, Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../frameworks/middleware";
import { BadRequestError } from "../../shared/error";
import { UploadImageUseCase } from "../../application/usecases/uploads/UploadImageUseCase";

export class UploadController {
  public router: Router = Router();

  private upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (_req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
      cb(new BadRequestError("Only image uploads are allowed."));
    },
  });

  constructor() {
    this.router.post(
      "/image",
      authMiddleware,
      this.upload.single("file"),
      this.uploadImageHandler.bind(this)
    );
  }

  async uploadImageHandler(req: any, res: Response, next: any) {
    try {
      const file = req.file as any | undefined;
      if (!file) {
        throw new BadRequestError("Image file is required (field name: file).");
      }

      const folder = typeof req.body.folder === "string" ? req.body.folder : undefined;

      const usecase = new UploadImageUseCase();
      const result = await usecase.execute({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        folder,
      });

      res.status(200).json({ ok: true, data: result } as any);
    } catch (error) {
      next(error);
    }
  }
}

