import { ActivityLog } from '../models/ActivityLog.js';

export async function logActivity({
  organizationId,
  entityId,
  entityType = 'incident',
  action,
  actorId,
  actorName,
  message,
  metadata = {},
}) {
  return ActivityLog.create({
    organizationId,
    entityId,
    entityType,
    action,
    actorId,
    actorName,
    message,
    metadata,
  });
}

export async function getActivityForEntity(organizationId, entityId, limit = 50) {
  return ActivityLog.find({ organizationId, entityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
