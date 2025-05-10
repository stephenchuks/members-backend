// src/controllers/authController.ts
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';
import Member, { IMember } from '../models/Member.js';
import {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
} from '../config/jwt.js';
import { setCache, getCached, clearCache } from '../utils/cache.js';

const { sign, verify } = jwt;

interface JwtPayload {
  userId: string;
  role: IUser['role'];
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, role, membershipType } = req.body as {
      email: string;
      password: string;
      role: IUser['role'];
      membershipType: IMember['membershipType'];
    };

    // Basic validation
    if (!email || !password || !role || !membershipType) {
      res.status(400).json({ message: 'Missing fields' });
      return;
    }

    if (await User.findOne({ email })) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    // Create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role });

    // Decide membership status
    const now = new Date();
    const oneYear = new Date(now);
    oneYear.setFullYear(oneYear.getFullYear() + 1);

    const status = membershipType === 'volunteer' ? 'active' : 'pending';

    // Create corresponding Member
    const member = await Member.create({
      membershipType,
      membershipStartDate: now,
      membershipExpirationDate: oneYear,
      status,
      membershipSource: 'signup',
      autoRenew: false,
      related: [],
    });

    res.status(201).json({
      message: 'Registered',
      userId: user.id,
      membershipID: member.membershipID,
      membershipStatus: member.status,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = (await User.findOne({ email })) as IUser | null;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const payload: JwtPayload = { userId: user.id, role: user.role };

    const accessOpts: SignOptions = {
      expiresIn: accessTokenExpiresIn as SignOptions['expiresIn'],
    };
    const refreshOpts: SignOptions = {
      expiresIn: refreshTokenExpiresIn as SignOptions['expiresIn'],
    };

    const accessToken = sign(payload, accessTokenSecret, accessOpts);
    const refreshToken = sign(payload, refreshTokenSecret, refreshOpts);

    await setCache(`refresh:${payload.userId}`, refreshToken, 7 * 24 * 3600);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ message: 'Missing token' });
    return;
  }
  try {
    const payload = verify(refreshToken, refreshTokenSecret) as JwtPayload;
    const stored = await getCached(`refresh:${payload.userId}`);
    if (stored !== refreshToken) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const accessOpts: SignOptions = {
      expiresIn: accessTokenExpiresIn as SignOptions['expiresIn'],
    };
    const refreshOpts: SignOptions = {
      expiresIn: refreshTokenExpiresIn as SignOptions['expiresIn'],
    };

    const newAccess = sign(payload, accessTokenSecret, accessOpts);
    const newRefresh = sign(payload, refreshTokenSecret, refreshOpts);

    await setCache(`refresh:${payload.userId}`, newRefresh, 7 * 24 * 3600);

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  // authenticate middleware sets req.user
  const { userId } = (req as any).user as JwtPayload;
  await clearCache(`refresh:${userId}`);
  res.sendStatus(204);
};
