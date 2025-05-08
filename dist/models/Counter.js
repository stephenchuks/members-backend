// src/models/Counter.ts
import mongoose, { Schema } from 'mongoose';
const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
}, { _id: false });
export default mongoose.model('Counter', counterSchema);
