// src/middleware/cache.ts
import type { Request, Response, NextFunction } from 'express';
import {
  generateMembersCacheKey,
  getCache,
  setCache,
  clearCache,
} from '../utils/cache.js';

const MEMBER_LIST_TTL = 60 * 60; // cache for 1 hour

export const cacheMembersList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const key = generateMembersCacheKey(req.query as any);
  const cached = await getCache(key);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.json(JSON.parse(cached));
    return;
  }

  // hijack res.json to set cache when data is sent
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    setCache(key, JSON.stringify(body), MEMBER_LIST_TTL).catch(console.error);
    res.setHeader('X-Cache', 'MISS');
    return originalJson(body);
  };

  next();
};

/**
 * Invalidate the members-list cache on create/update/delete
 */
export const clearMembersListCache = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const baseKey = 'members:list';        // we'll delete all variants
  // Redis doesn't support wildcards with del(), but in a real app
  // you'd use SCAN + DEL or Redis keyspaces. Here, for simplicity:
  clearCache(`${baseKey}:*`).catch(console.error);
  next();
};
