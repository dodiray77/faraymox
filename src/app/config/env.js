import dotenv from "dotenv";
dotenv.config();
export const env = {
  appName: process.env.APP_NAME,
  host: process.env.HOST,
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
  //   jwtSecret: process.env.JWT_SECRET,
  //   jwtExpires: process.env.JWT_EXPIRES,
  //   corsOrigin: process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || true,
  dbUrl: process.env.DATABASE_URL || "./db/dev.db",
};
