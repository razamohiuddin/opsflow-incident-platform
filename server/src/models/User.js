import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    lastActiveOrganizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

toJSONPlugin(userSchema);

export const User = mongoose.model('User', userSchema);
