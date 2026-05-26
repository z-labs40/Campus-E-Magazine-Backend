import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { config } from "../config";
import { initializeDataSource } from "../infrastructure/database";
import { initializeSocket } from "../infrastructure/socket";
import { Logger } from "../shared/logger";
import { errorHandler, loggerMiddleware } from "./middleware";
import registerRoutes from "./routes";

const app = express();

let isAppReady = false;
let resolveAppReady: () => void;
const appReadyPromise = new Promise<void>((resolve) => {
  resolveAppReady = resolve;
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

app.use(async (req, res, next) => {
  if (req.path === "/health" || isAppReady) {
    return next();
  }
  try {
    await appReadyPromise;
    next();
  } catch (err) {
    next(err);
  }
});

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.frontendUrl,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(loggerMiddleware);

const startHTTPServer = async () => {
  Logger.info("Starting Campus E-Magazine server...");
  const PORT = config.port;

  const httpServer = http.createServer(app);

  httpServer.listen(PORT, "0.0.0.0", () => {
    Logger.info(`Server listening on http://0.0.0.0:${PORT}`);
    Logger.info(`Health check: http://localhost:${PORT}/health`);
  });

  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    Logger.error(`Server error: ${error.message}`);
    if (error.code === "EADDRINUSE") {
      Logger.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  try {
    await initializeDataSource();
    Logger.info("Database initialized");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    Logger.error(`Database initialization failed: ${message}`);
    Logger.error("Server is running but database is not connected");
  }

  try {
    initializeSocket(httpServer);
    registerRoutes(app);
    Logger.info("Routes and WebSocket initialized");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    Logger.error(`Route initialization failed: ${message}`);
  } finally {
    isAppReady = true;
    resolveAppReady();
  }

  app.use(errorHandler);
};

process.on("uncaughtException", (error: Error) => {
  Logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  Logger.error(`Unhandled Rejection: ${reason}`);
});

process.on("SIGTERM", () => {
  Logger.info("SIGTERM received, shutting down...");
  process.exit(0);
});

startHTTPServer().catch((error) => {
  Logger.error(`Failed to start server: ${error}`);
  process.exit(1);
});
