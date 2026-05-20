import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';
import { ROLES } from '../shared/constants.js';

const inviteSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ROLES, required: true },
    tokenHash: { type: String, required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

inviteSchema.index(
  { organizationId: 1, email: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

toJSONPlugin(inviteSchema);

export const Invite = mongoose.model('Invite', inviteSchema);
