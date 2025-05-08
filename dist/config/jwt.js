// src/config/jwt.ts
export const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
export const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
export const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES || '15m';
export const refreshTokenExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES || '7d';
