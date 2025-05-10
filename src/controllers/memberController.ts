// src/controllers/memberController.ts
import type { Request, Response, NextFunction } from 'express';
import { DbService } from '../services/dbService.js';
import MemberModel, { IMember } from '../models/Member.js';
import {
  generateMembersCacheKey,
  getCached,
  setCache,
  clearMembersCache,
} from '../utils/cache.js';

const svc = new DbService<IMember>(MemberModel);

export const getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, membershipType, page = '1', limit = '10' } = req.query as any;
    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const filter: any = {};
    if (status) filter.status = status;
    if (membershipType) filter.membershipType = membershipType;

    const cacheKey = generateMembersCacheKey({ status, membershipType, page: pageNum, limit: limitNum });
    const cached = await getCached(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const skip = (pageNum - 1) * limitNum;
    const [total, data] = await Promise.all([
      svc.count(filter),
      svc.findAll(filter, { skip, limit: limitNum, sort: { createdAt: -1 } }),
    ]);

    const result = { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum), data };
    await setCache(cacheKey, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await svc.create(req.body as Partial<IMember>);
    await clearMembersCache();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const getMemberById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await svc.findOne({ membershipID: req.params.id });
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
};

export const updateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await svc.updateOne({ membershipID: req.params.id }, req.body as Partial<IMember>);
    if (!updated) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    await clearMembersCache();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await svc.deleteOne({ membershipID: req.params.id });
    if (!deleted) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    await clearMembersCache();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
