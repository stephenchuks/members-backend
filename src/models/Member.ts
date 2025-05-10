// src/models/Member.ts
import mongoose, { Schema, Document } from 'mongoose';
import Counter from './Counter.js';

export type MembershipType = 'volunteer' | 'standard' | 'executive';

export interface IMember extends Document {
  membershipID: string;
  membershipType: MembershipType;
  memberSince: Date;
  membershipStartDate: Date;
  membershipExpirationDate: Date;
  status: 'pending' | 'active' | 'expired';
  membershipSource: string;
  autoRenew: boolean;
  related: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    membershipID: { type: String, unique: true },
    membershipType: {
      type: String,
      required: true,
      enum: ['volunteer', 'standard', 'executive'],
    },
    memberSince: { type: Date, default: () => new Date() },
    membershipStartDate: { type: Date, required: true },
    membershipExpirationDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['pending','active','expired'] },
    membershipSource: { type: String, required: true },
    autoRenew: { type: Boolean, default: false },
    related: { type: [String], default: [] },
  },
  { timestamps: true }
);

MemberSchema.pre('validate', async function (next) {
  if (!this.membershipID) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'member' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    const num = String(counter.seq).padStart(6, '0');
    this.membershipID = `MBR${num}`;
  }
  next();
});

// Indexes for fast lookups & filters
MemberSchema.index({ membershipID: 1 });
MemberSchema.index({ status: 1 });
MemberSchema.index({ membershipType: 1 });
MemberSchema.index({ createdAt: -1 });

export default mongoose.model<IMember>('Member', MemberSchema);
