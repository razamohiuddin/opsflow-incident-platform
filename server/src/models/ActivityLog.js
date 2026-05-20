import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    entityType: { type: String, default: 'incident' },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ organizationId: 1, entityId: 1, createdAt: -1 });

toJSONPlugin(activityLogSchema);

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
