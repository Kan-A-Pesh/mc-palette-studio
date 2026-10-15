import Redis from "ioredis";
import { env } from "@repo/env/apps-web";

export const redis = new Redis(`${env.REDIS_URL}?family=0`);
