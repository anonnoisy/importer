import { PrismaClient } from "@prisma/client";
import { ConnectionOptions } from "bullmq";

export type Context = {
  db: PrismaClient;
  redisConnection: ConnectionOptions;
};

const PRISMA = new PrismaClient();

export const context: Context = {
  db: PRISMA,
  redisConnection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD,
  },
} as const;
