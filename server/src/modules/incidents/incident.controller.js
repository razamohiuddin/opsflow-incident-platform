import { Incident } from '../../models/Incident.js';
import { Comment } from '../../models/Comment.js';
import { User } from '../../models/User.js';
import { success, fail } from '../../shared/response.js';
import { logActivity, getActivityForEntity } from '../../services/activityService.js';
import {
  buildAssigneeSnapshot,
  getOrgMembers,
} from '../../services/organizationService.js';
import { parseMentions, escapeRegex } from '../../shared/utils.js';
import { getIO } from '../../sockets/index.js';

function buildListQuery(tenantId, query) {
  const filter = { organizationId: tenantId };

  if (query.status) {
    const statuses = Array.isArray(query.status) ? query.status : [query.status];
    filter.status = { $in: statuses };
  }
  if (query.severity) {
    const severities = Array.isArray(query.severity) ? query.severity : [query.severity];
    filter.severity = { $in: severities };
  }
  if (query.assigneeId === 'unassigned') {
    filter.assigneeId = null;
  } else if (query.assigneeId) {
    filter.assigneeId = query.assigneeId;
  }
  if (query.reporterId) {
    filter.reporterId = query.reporterId;
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  if (query.q) {
    filter.title = { $regex: escapeRegex(query.q), $options: 'i' };
  }

  return filter;
}

export async function listIncidents(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const { page, limit, sort, order } = query;
    const filter = buildListQuery(req.tenant.organizationId, query);
    const skip = (page - 1) * limit;
    const sortDir = order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Incident.find(filter).sort({ [sort]: sortDir }).skip(skip).limit(limit),
      Incident.countDocuments(filter),
    ]);

    return success(res, items.map((i) => i.toJSON()), {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function getIncident(req, res, next) {
  try {
    const incident = await Incident.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
    });
    if (!incident) {
      return fail(res, { status: 404, code: 'NOT_FOUND', message: 'Incident not found' });
    }
    const activity = await getActivityForEntity(
      req.tenant.organizationId,
      incident._id
    );
    return success(res, {
      incident: incident.toJSON(),
      activity: activity.map((a) => ({
        id: a._id.toString(),
        action: a.action,
        message: a.message,
        actorName: a.actorName,
        createdAt: a.createdAt,
        metadata: a.metadata,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createIncident(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const assigneeSnapshot = await buildAssigneeSnapshot(req.body.assigneeId || null);

    const incident = await Incident.create({
      organizationId: req.tenant.organizationId,
      title: req.body.title,
      description: req.body.description,
      severity: req.body.severity,
      status: req.body.status,
      tags: req.body.tags,
      assigneeId: req.body.assigneeId || null,
      assigneeSnapshot,
      reporterId: user._id,
      reporterSnapshot: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      dueDate: req.body.dueDate || null,
    });

    await logActivity({
      organizationId: req.tenant.organizationId,
      entityId: incident._id,
      action: 'incident.created',
      actorId: user._id,
      actorName: user.name,
      message: `${user.name} created this incident`,
      metadata: { title: incident.title },
    });

    const io = getIO();
    io?.to(`org:${req.tenant.organizationId}`).emit('incident:updated', incident.toJSON());

    return success(res, incident.toJSON(), null, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateIncident(req, res, next) {
  try {
    const incident = req.incident || (await Incident.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
    }));

    if (!incident) {
      return fail(res, { status: 404, code: 'NOT_FOUND', message: 'Incident not found' });
    }

    if (req.body.version !== incident.version) {
      return fail(res, {
        status: 409,
        code: 'CONFLICT',
        message: 'Incident was updated by someone else',
      });
    }

    const user = await User.findById(req.user.id);
    const changes = [];

    if (req.body.title !== undefined && req.body.title !== incident.title) {
      incident.title = req.body.title;
    }
    if (req.body.description !== undefined) incident.description = req.body.description;
    if (req.body.tags !== undefined) incident.tags = req.body.tags;

    if (req.body.severity !== undefined && req.body.severity !== incident.severity) {
      changes.push({
        action: 'severity_changed',
        message: `${user.name} changed severity from ${incident.severity} to ${req.body.severity}`,
        metadata: { from: incident.severity, to: req.body.severity },
      });
      incident.severity = req.body.severity;
    }

    if (req.body.status !== undefined && req.body.status !== incident.status) {
      changes.push({
        action: 'status_changed',
        message: `${user.name} changed status from ${incident.status} to ${req.body.status}`,
        metadata: { from: incident.status, to: req.body.status },
      });
      incident.status = req.body.status;
      if (['resolved', 'closed'].includes(req.body.status) && !incident.resolvedAt) {
        incident.resolvedAt = new Date();
      }
    }

    if (req.body.assigneeId !== undefined) {
      const newId = req.body.assigneeId || null;
      const oldId = incident.assigneeId?.toString() || null;
      if (newId !== oldId) {
        incident.assigneeId = newId;
        incident.assigneeSnapshot = await buildAssigneeSnapshot(newId);
        changes.push({
          action: 'assignee_changed',
          message: `${user.name} updated assignee`,
          metadata: { fromId: oldId, toId: newId },
        });
      }
    }

    if (req.body.dueDate !== undefined) incident.dueDate = req.body.dueDate;

    incident.version += 1;
    await incident.save();

    for (const c of changes) {
      await logActivity({
        organizationId: req.tenant.organizationId,
        entityId: incident._id,
        action: c.action,
        actorId: user._id,
        actorName: user.name,
        message: c.message,
        metadata: c.metadata,
      });
    }

    const json = incident.toJSON();
    const io = getIO();
    io?.to(`org:${req.tenant.organizationId}`).emit('incident:updated', json);
    if (changes.some((c) => c.action === 'assignee_changed')) {
      io?.to(`org:${req.tenant.organizationId}`).emit('incident:assigned', json);
    }

    return success(res, json);
  } catch (err) {
    next(err);
  }
}

export async function deleteIncident(req, res, next) {
  try {
    const result = await Incident.deleteOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
    });
    if (result.deletedCount === 0) {
      return fail(res, { status: 404, code: 'NOT_FOUND', message: 'Incident not found' });
    }
    return success(res, {});
  } catch (err) {
    next(err);
  }
}

export async function listComments(req, res, next) {
  try {
    const incident = await Incident.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
    });
    if (!incident) {
      return fail(res, { status: 404, code: 'NOT_FOUND', message: 'Incident not found' });
    }
    const comments = await Comment.find({ incidentId: incident._id }).sort({ createdAt: 1 });
    return success(res, comments.map((c) => c.toJSON()));
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const incident = await Incident.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
    });
    if (!incident) {
      return fail(res, { status: 404, code: 'NOT_FOUND', message: 'Incident not found' });
    }

    const user = await User.findById(req.user.id);
    const members = await getOrgMembers(req.tenant.organizationId);
    const membersWithIds = await User.find({
      _id: { $in: members.map((m) => m.id) },
    }).lean();

    const mentions = parseMentions(req.body.body, membersWithIds);

    const comment = await Comment.create({
      organizationId: req.tenant.organizationId,
      incidentId: incident._id,
      authorId: user._id,
      authorName: user.name,
      body: req.body.body,
      mentions,
    });

    await logActivity({
      organizationId: req.tenant.organizationId,
      entityId: incident._id,
      action: 'comment.added',
      actorId: user._id,
      actorName: user.name,
      message: `${user.name} added a comment`,
      metadata: { commentId: comment._id.toString() },
    });

    const json = comment.toJSON();
    const io = getIO();
    io?.to(`org:${req.tenant.organizationId}`).emit('comment:created', {
      incidentId: incident._id.toString(),
      comment: json,
    });

    return success(res, json, null, 201);
  } catch (err) {
    next(err);
  }
}
