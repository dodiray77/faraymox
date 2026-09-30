import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "@/app/config/env";

const adapter = new PrismaBetterSqlite3({
  url: env.dbUrl,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
