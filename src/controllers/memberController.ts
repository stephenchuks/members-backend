// src/controllers/memberController.ts
import { RequestHandler } from 'express';
import Member, { IMember } from '../models/Member.js';

export const createMember: RequestHandler = async (req, res) => {
  try {
    const data = req.body as Partial<Omit<IMember, 'membershipID' | 'memberSince'>>;
    const member = await Member.create(data);
    res.status(201).json(member);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const getMembers: RequestHandler = async (req, res) => {
  try {
    const { status, membershipType, page = 1, limit = 10 } = req.query as any;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (membershipType) filter.membershipType = membershipType;
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      Member.countDocuments(filter),
      Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);
    res.json({ total, page, limit, pages: Math.ceil(total / limit), data });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const getMemberById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findOne({ membershipID: id });
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(member);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const updateMember: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body as Partial<IMember>;
    const member = await Member.findOneAndUpdate(
      { membershipID: id },
      update,
      { new: true }
    );
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(member);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const deleteMember: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Member.findOneAndDelete({ membershipID: id });
    if (!result) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.sendStatus(204);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};
