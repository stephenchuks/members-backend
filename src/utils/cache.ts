// src/utils/cache.ts
import redis from '../config/redis.js';

export const MEMBERS_CACHE_PREFIX = 'members:';
const DEFAULT_TTL_SECONDS = 60; // cache duration

/**
 * Generate a cache key for a members list query.
 * e.g. members:{"page":1,"limit":10}
 */
export function generateMembersCacheKey(query: Record<string, any>): string {
  // Only include relevant params
  const { page, limit, status, membershipType } = query;
  const keyObj: Record<string, any> = { page, limit };
  if (status) keyObj.status = status;
  if (membershipType) keyObj.membershipType = membershipType;
  return MEMBERS_CACHE_PREFIX + JSON.stringify(keyObj);
}

/** Try to get a cached value by key */
export async function getCached(key: string): Promise<string | null> {
  return redis.get(key);
}

/** Set a cache entry with TTL */
export async function setCache(key: string, value: string, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
  await redis.set(key, value, 'EX', ttlSeconds);
}

/** Invalidate all members-list caches */
export async function clearMembersCache(): Promise<void> {
  const keys = await redis.keys(`${MEMBERS_CACHE_PREFIX}*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
