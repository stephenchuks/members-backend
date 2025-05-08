// src/models/Counter.ts
import mongoose, { Schema, Document } from 'mongoose';

interface ICounter extends Document {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { _id: false }
);

export default mongoose.model<ICounter>('Counter', counterSchema);
