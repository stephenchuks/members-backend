
import redis from '../config/redis.js';

const DEFAULT_TTL = 60 * 5; // 5 minutes

/**
 * Store a value under `key` for `ttlSeconds`.
 */
export async function setCache(
  key: string,
  value: string,
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  await redis.set(key, value, 'EX', ttlSeconds);
}

/**
 * Retrieve a cached value, or null if missing.
 */
export async function getCached(key: string): Promise<string | null> {
  return await redis.get(key);
}

/**
 * Delete a single cache key.
 */
export async function clearCache(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * Generate a consistent key for listing members with given filters/pagination.
 */
export function generateMembersCacheKey(params: Record<string, any>): string {
  // e.g. "members:page=1&limit=5&status=active"
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `members:${sorted}`;
}

/**
 * Invalidate *all* members-list cache entries.
 * Uses SCAN rather than KEYS to avoid blocking in production.
 */
export async function clearMembersCache(): Promise<void> {
  const stream = redis.scanStream({ match: 'members:*', count: 100 });
  const pipeline = redis.pipeline();
  stream.on('data', (keys: string[]) => {
    keys.forEach((k) => pipeline.del(k));
  });
  await new Promise<void>((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
  await pipeline.exec();
}
