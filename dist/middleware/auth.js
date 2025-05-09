import jwt from 'jsonwebtoken';
import { accessTokenSecret } from '../config/jwt.js';
/** Verify Bearer token and attach payload to req.user */
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Missing or invalid token' });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, accessTokenSecret);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};
/** Restrict to specific roles */
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        next();
    };
};
