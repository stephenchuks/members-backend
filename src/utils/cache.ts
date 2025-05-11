// src/utils/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err);
});

export function generateMembersCacheKey(queryParams: {
  page?: string;
  limit?: string;
  status?: string;
}): string {
  const page = queryParams.page ?? '1';
  const limit = queryParams.limit ?? '10';
  const status = queryParams.status ?? 'all';
  return `members:list:${page}:${limit}:${status}`;
}

export async function setCache(
  key: string,
  val: string,
  ttlSeconds: number
): Promise<void> {
  await redis.set(key, val, 'EX', ttlSeconds);
}

export async function getCache(key: string): Promise<string | null> {
  return await redis.get(key);
}

export async function clearCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function blacklistToken(token: string, ttlSeconds: number): Promise<void> {
  await redis.set(`bl_${token}`, '1', 'EX', ttlSeconds);
}

export async function isBlacklisted(token: string): Promise<boolean> {
  return (await redis.exists(`bl_${token}`)) === 1;
}