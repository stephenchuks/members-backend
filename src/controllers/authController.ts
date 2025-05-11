// src/controllers/authController.ts
import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { 
  jwt,
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
} from '../config/jwt.js';
import User from '../models/User.js';
import { setCache, getCache, clearCache, blacklistToken } from '../utils/cache.js';
import type { SignOptions } from 'jsonwebtoken';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  role?: string;
}

interface RefreshPayload {
  refreshToken: string;
}

export const register: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { email, password, role = 'user' } = req.body as RegisterPayload;
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ email, password: hash, role });
    res.status(201).json({ id: u._id, email: u.email, role: u.role });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { email, password } = req.body as LoginPayload;
    const user = await User.findOne({ email }).exec();
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const payload = { userId: String(user._id), role: user.role };
    const jwtOptions: SignOptions = { expiresIn: accessTokenExpiresIn };
    
    // No type assertions needed - types are now locked in config
    const accessToken = jwt.sign(payload, accessTokenSecret, jwtOptions);
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { 
      expiresIn: refreshTokenExpiresIn 
    });

    await setCache(`refresh:${payload.userId}`, refreshToken, 7 * 24 * 3600);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

export const refreshToken: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { refreshToken: incoming } = req.body as RefreshPayload;
    const decoded = jwt.decode(incoming) as { userId?: string; role?: string };
    
    if (!decoded?.userId) {
      res.status(400).json({ message: 'Malformed token' });
      return;
    }

    const stored = await getCache(`refresh:${decoded.userId}`);
    if (stored !== incoming) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const newAccess = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      accessTokenSecret,
      { expiresIn: accessTokenExpiresIn }
    );
    
    res.json({ accessToken: newAccess });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const header = req.get('Authorization') || '';
    if (!header.startsWith('Bearer ')) {
      res.sendStatus(204);
      return;
    }

    const token = header.slice(7);
    const decoded = jwt.decode(token) as { userId?: string; exp?: number };
    
    if (decoded?.userId && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      await clearCache(`refresh:${decoded.userId}`);
      if (ttl > 0) {
        await blacklistToken(token, ttl);
      }
    }
    
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};