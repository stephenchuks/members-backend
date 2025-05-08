import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { accessTokenSecret } from '../config/jwt.js';

interface JwtPayload {
  userId: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// Extend Express’s Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

/** Verify Bearer token and attach payload to req.user */
export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid token' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, accessTokenSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};

/** Restrict to specific roles */
export const authorize = (roles: Array<'user' | 'admin'>): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
};
