// src/config/jwt.ts
import jsonwebtoken from 'jsonwebtoken';
import type { StringValue } from 'ms';  // bring in the branded string type

export const jwt = jsonwebtoken;

// Secrets remain plain strings (these aren’t branded):
export const accessTokenSecret: jsonwebtoken.Secret =
  process.env.JWT_ACCESS_TOKEN_SECRET!;

export const refreshTokenSecret: jsonwebtoken.Secret =
  process.env.JWT_REFRESH_TOKEN_SECRET!;

// Cast the env‐vars to StringValue so they satisfy SignOptions['expiresIn']:
export const accessTokenExpiresIn = process.env
  .JWT_ACCESS_TOKEN_EXPIRES! as StringValue;

export const refreshTokenExpiresIn = process.env
  .JWT_REFRESH_TOKEN_EXPIRES! as StringValue;
