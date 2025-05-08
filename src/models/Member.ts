// src/models/Member.ts
import mongoose, { Schema, Document } from 'mongoose';
import Counter from './Counter.js';

export interface IMember extends Document {
  membershipID: string;
  membershipType: string;
  memberSince: Date;
  membershipStartDate: Date;
  membershipExpirationDate: Date;
  status: string;
  membershipSource: string;
  autoRenew: boolean;
  related: mongoose.Types.ObjectId[];
}

const memberSchema = new Schema<IMember>(
  {
    membershipID: { type: String, required: true, unique: true },
    membershipType: { type: String, required: true },
    memberSince: { type: Date, required: true, default: Date.now },
    membershipStartDate: { type: Date, required: true },
    membershipExpirationDate: { type: Date, required: true },
    status: { type: String, required: true },
    membershipSource: { type: String, required: true },
    autoRenew: { type: Boolean, default: false },
    related: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  },
  { timestamps: true }
);

// Pre-validate hook to auto-increment the alphanumeric ID
memberSchema.pre('validate', async function (next) {
  if (!this.membershipID) {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'memberID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.membershipID = `MBR${counter.seq.toString().padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<IMember>('Member', memberSchema);
