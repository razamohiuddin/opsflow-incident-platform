import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { OrganizationMember } from '../models/OrganizationMember.js';
import { Incident } from '../models/Incident.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Comment } from '../models/Comment.js';

dotenv.config();

async function seed() {
  await connectDB();

  await Promise.all([
    Comment.deleteMany({}),
    ActivityLog.deleteMany({}),
    Incident.deleteMany({}),
    OrganizationMember.deleteMany({}),
    Organization.deleteMany({}),
    User.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 12);

  const alex = await User.create({
    name: 'Alex Chen',
    email: 'alex@acme.io',
    passwordHash,
  });
  const jordan = await User.create({
    name: 'Jordan Lee',
    email: 'jordan@acme.io',
    passwordHash,
  });
  const sam = await User.create({
    name: 'Sam Rivera',
    email: 'sam@acme.io',
    passwordHash,
  });

  const acme = await Organization.create({
    name: 'Acme Engineering',
    slug: 'acme',
    createdBy: alex._id,
  });

  await OrganizationMember.insertMany([
    { organizationId: acme._id, userId: alex._id, role: 'admin' },
    { organizationId: acme._id, userId: jordan._id, role: 'manager' },
    { organizationId: acme._id, userId: sam._id, role: 'developer' },
  ]);

  alex.lastActiveOrganizationId = acme._id;
  await alex.save();

  const day = 86400000;
  const now = Date.now();

  const inc1 = await Incident.create({
    organizationId: acme._id,
    title: 'API latency spike in production',
    description: 'P99 latency exceeded 2s on checkout service.',
    severity: 'critical',
    status: 'in_progress',
    tags: ['api', 'production'],
    assigneeId: jordan._id,
    assigneeSnapshot: { id: jordan._id.toString(), name: jordan.name, email: jordan.email },
    reporterId: alex._id,
    reporterSnapshot: { id: alex._id.toString(), name: alex.name, email: alex.email },
    dueDate: new Date(now + day * 2),
    version: 1,
  });

  await ActivityLog.insertMany([
    {
      organizationId: acme._id,
      entityId: inc1._id,
      action: 'incident.created',
      actorId: alex._id,
      actorName: alex.name,
      message: `${alex.name} created this incident`,
    },
    {
      organizationId: acme._id,
      entityId: inc1._id,
      action: 'status_changed',
      actorId: jordan._id,
      actorName: jordan.name,
      message: `${jordan.name} changed status to in progress`,
      metadata: { from: 'open', to: 'in_progress' },
    },
  ]);

  await Incident.create({
    organizationId: acme._id,
    title: 'Database connection pool exhaustion',
    description: 'MongoDB connections maxed out during peak traffic.',
    severity: 'high',
    status: 'open',
    tags: ['database'],
    assigneeId: sam._id,
    assigneeSnapshot: { id: sam._id.toString(), name: sam.name, email: sam.email },
    reporterId: jordan._id,
    reporterSnapshot: { id: jordan._id.toString(), name: jordan.name, email: jordan.email },
    dueDate: new Date(now + day * 5),
    version: 1,
  });

  await Comment.create({
    organizationId: acme._id,
    incidentId: inc1._id,
    authorId: jordan._id,
    authorName: jordan.name,
    body: 'Investigating rollback. @jordan@acme.io on call.',
    mentions: [jordan._id],
  });

  console.log('Seed complete');
  console.log('Login: alex@acme.io / password123');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
