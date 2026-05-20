import mongoose from 'mongoose';
import { Incident } from '../../models/Incident.js';
import { ActivityLog } from '../../models/ActivityLog.js';
import { success } from '../../shared/response.js';

export async function getMetrics(req, res, next) {
  try {
    const orgId = new mongoose.Types.ObjectId(req.tenant.organizationId);

    const [facet] = await Incident.aggregate([
      { $match: { organizationId: orgId } },
      {
        $facet: {
          openCount: [
            { $match: { status: { $in: ['open', 'in_progress'] } } },
            { $count: 'count' },
          ],
          closedCount: [
            { $match: { status: { $in: ['resolved', 'closed'] } } },
            { $count: 'count' },
          ],
          bySeverity: [{ $group: { _id: '$severity', count: { $sum: 1 } } }],
          avgResolution: [
            { $match: { resolvedAt: { $ne: null } } },
            {
              $project: {
                duration: { $subtract: ['$resolvedAt', '$createdAt'] },
              },
            },
            { $group: { _id: null, avg: { $avg: '$duration' } } },
          ],
        },
      },
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await ActivityLog.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$actorId', name: { $first: '$actorName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const metrics = {
      openCount: facet.openCount[0]?.count || 0,
      closedCount: facet.closedCount[0]?.count || 0,
      bySeverity: (facet.bySeverity || []).map((s) => ({
        severity: s._id,
        count: s.count,
      })),
      avgResolutionMs: facet.avgResolution[0]?.avg || 0,
      activeUsers: activeUsers.map((u) => ({
        userId: u._id.toString(),
        name: u.name,
        count: u.count,
      })),
    };

    return success(res, metrics);
  } catch (err) {
    next(err);
  }
}
