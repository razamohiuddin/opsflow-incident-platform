import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';
import { ROLES } from '../shared/constants.js';

const memberSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ROLES, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

memberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

toJSONPlugin(memberSchema);

export const OrganizationMember = mongoose.model('OrganizationMember', memberSchema);
