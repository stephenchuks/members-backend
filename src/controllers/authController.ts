// src/controllers/authController.ts
import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';           // ← changed
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
} from '../config/jwt.js';

export const register: RequestHandler = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);    // same API
    await new User({ email, password: hashed, role }).save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);  // same API
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const userId = String(user._id);
    const accessToken = jwt.sign(
      { userId, role: user.role },
      accessTokenSecret,
      { expiresIn: accessTokenExpiresIn } as any
    );
    const refreshToken = jwt.sign(
      { userId, role: user.role },
      refreshTokenSecret,
      { expiresIn: refreshTokenExpiresIn } as any
    );

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
