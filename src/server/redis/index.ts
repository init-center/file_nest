import redis from "ioredis";

export function createRedisClient() {
  const url = process.env.REDIS_DB_URL || "redis://localhost:6379";
  return new redis(url);
}

export default createRedisClient();
