import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config";
import { Logger } from "../shared/logger";
import { User } from "../adapters/models/User";
import { Magazine } from "../adapters/models/Magazine";
import { Suggestion } from "../adapters/models/Suggestion";
import { Notification } from "../adapters/models/Notification";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  synchronize: true,
  logging: false,
  entities: [User, Magazine, Suggestion, Notification],
  subscribers: [],
  migrations: [],
  ...(config.db.ssl
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

export async function initializeDataSource() {
  if (!AppDataSource.isInitialized) {
    Logger.info("Connecting to PostgreSQL...");
    await AppDataSource.initialize();
    Logger.info("Database connection established.");
  }
}
