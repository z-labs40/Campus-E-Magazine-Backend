import dotenv from "dotenv";
import defaultConfig from "./default";
import { Logger } from "../shared/logger";

dotenv.config();

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  name: string;
  ssl: boolean;
}

export interface AppConfig {
  port: number;
  env: string;
  frontendUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  db: DBConfig;
}

export class Config {
  private static config: AppConfig | null = null;

  private static validate(config: AppConfig): void {
    const requiredVars = [
      { key: "PORT", value: config.port },
      { key: "NODE_ENV", value: config.env },
      { key: "JWT_SECRET", value: config.jwt.secret },
      { key: "JWT_EXPIRE", value: config.jwt.expiresIn },
      { key: "DB_HOST", value: config.db.host },
      { key: "DB_PORT", value: config.db.port },
      { key: "DB_USER", value: config.db.user },
      { key: "DB_NAME", value: config.db.name },
    ];

    const missing = requiredVars
      .filter(
        (v) =>
          v.value === undefined ||
          v.value === null ||
          v.value === "" ||
          Number.isNaN(v.value)
      )
      .map((v) => v.key);

    if (missing.length > 0) {
      Logger.error(
        `Missing or invalid environment variables: ${missing.join(", ")}`
      );
      process.exit(1);
    }

    Logger.info("Configuration validated successfully.");
  }

  static get(): AppConfig {
    if (!Config.config) {
      Config.config = defaultConfig();
      Config.validate(Config.config);
    }
    return Config.config;
  }
}

export const config = Config.get();
