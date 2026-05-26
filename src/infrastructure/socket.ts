import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { Logger } from "../shared/logger";

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [
        config.frontendUrl,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };
      (socket as Socket & { user?: typeof decoded }).user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as Socket & { user?: { id: string; role: string } })
      .user;
    if (user) {
      socket.join(`user:${user.id}`);
      if (user.role === "admin") {
        socket.join("admins");
      }
      Logger.info(`Socket connected: ${user.id} (${user.role})`);
    }

    socket.on("disconnect", () => {
      Logger.info("Socket disconnected");
    });
  });

  Logger.info("WebSocket server initialized");
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function emitToAdmins(event: string, payload: unknown) {
  if (io) {
    io.to("admins").emit(event, payload);
  }
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

export function emitBroadcast(event: string, payload: unknown) {
  if (io) {
    io.emit(event, payload);
  }
}
