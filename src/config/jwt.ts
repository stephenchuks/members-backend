// src/config/jwt.ts
export const accessTokenExpiresIn: number | string = '15m';
export const refreshTokenExpiresIn: number | string = '7d';
export const accessTokenSecret: string = process.env.JWT_ACCESS_TOKEN_SECRET!;
export const refreshTokenSecret: string = process.env.JWT_REFRESH_TOKEN_SECRET!;
