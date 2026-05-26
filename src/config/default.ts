import { AppConfig } from "./index";
import { Logger } from "../shared/logger";

export default (): AppConfig => {
  Logger.info("Loading configuration from environment...");
  return {
    port: Number(process.env.PORT) || 5000,
    env: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
    db: {
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME as string,
      ssl: process.env.DB_SSL === "true",
    },
  };
};
