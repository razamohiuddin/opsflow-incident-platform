import { Organization } from '../models/Organization.js';
import { OrganizationMember } from '../models/OrganizationMember.js';
import { User } from '../models/User.js';

export async function getUserOrganizations(userId) {
  const memberships = await OrganizationMember.find({ userId }).lean();
  const orgIds = memberships.map((m) => m.organizationId);
  const orgs = await Organization.find({ _id: { $in: orgIds } }).lean();
  return memberships.map((m) => {
    const org = orgs.find((o) => o._id.toString() === m.organizationId.toString());
    return {
      id: org._id.toString(),
      name: org.name,
      slug: org.slug,
      role: m.role,
    };
  });
}

export async function getMembership(userId, organizationId) {
  return OrganizationMember.findOne({ userId, organizationId });
}

export async function getOrgMembers(organizationId) {
  const members = await OrganizationMember.find({ organizationId }).lean();
  const userIds = members.map((m) => m.userId);
  const users = await User.find({ _id: { $in: userIds }, deletedAt: null }).lean();
  return members
    .map((m) => {
      const user = users.find((u) => u._id.toString() === m.userId.toString());
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: m.role,
      };
    })
    .filter(Boolean);
}

export async function buildAssigneeSnapshot(assigneeId) {
  if (!assigneeId) return null;
  const user = await User.findById(assigneeId).lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
