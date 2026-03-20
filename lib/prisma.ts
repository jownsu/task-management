import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { ENV } from "@/constants/env";

const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL, ssl: ENV.NODE_ENV === "production" ? { rejectUnauthorized: true } : false });
const prisma = new PrismaClient({ adapter });

export default prisma;
