import { Organization } from '../../models/Organization.js';
import { OrganizationMember } from '../../models/OrganizationMember.js';
import { Invite } from '../../models/Invite.js';
import { User } from '../../models/User.js';
import { success, fail } from '../../shared/response.js';
import {
  getUserOrganizations,
  getOrgMembers,
  getMembership,
} from '../../services/organizationService.js';
import { signAccessToken } from '../../services/tokenService.js';
import { hashToken, generateToken } from '../../shared/utils.js';

export async function listOrganizations(req, res, next) {
  try {
    const orgs = await getUserOrganizations(req.user.id);
    return success(res, orgs);
  } catch (err) {
    next(err);
  }
}

export async function createOrganization(req, res, next) {
  try {
    const { name } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const org = await Organization.create({
      name,
      slug,
      createdBy: req.user.id,
    });
    await OrganizationMember.create({
      organizationId: org._id,
      userId: req.user.id,
      role: 'admin',
    });
    await User.findByIdAndUpdate(req.user.id, { lastActiveOrganizationId: org._id });
    return success(res, {
      id: org._id.toString(),
      name: org.name,
      slug: org.slug,
      role: 'admin',
    }, null, 201);
  } catch (err) {
    next(err);
  }
}

export async function switchOrganization(req, res, next) {
  try {
    const { id } = req.params;
    const membership = await getMembership(req.user.id, id);
    if (!membership) {
      return fail(res, { status: 403, code: 'FORBIDDEN', message: 'Organization access denied' });
    }
    const org = await Organization.findById(id);
    await User.findByIdAndUpdate(req.user.id, { lastActiveOrganizationId: org._id });
    const accessToken = signAccessToken({
      sub: req.user.id,
      email: req.user.email,
      activeOrganizationId: id,
    });
    return success(res, {
      organization: {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        role: membership.role,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function listMembers(req, res, next) {
  try {
    const members = await getOrgMembers(req.tenant.organizationId);
    return success(res, members);
  } catch (err) {
    next(err);
  }
}

export async function listInvites(req, res, next) {
  try {
    const invites = await Invite.find({
      organizationId: req.tenant.organizationId,
      status: 'pending',
    }).sort({ createdAt: -1 });
    return success(res, invites.map((i) => i.toJSON()));
  } catch (err) {
    next(err);
  }
}

export async function createInvite(req, res, next) {
  try {
    const { email, role } = req.body;
    const existing = await Invite.findOne({
      organizationId: req.tenant.organizationId,
      email: email.toLowerCase(),
      status: 'pending',
    });
    if (existing) {
      return fail(res, {
        status: 409,
        code: 'CONFLICT',
        message: 'Invite already pending for this email',
      });
    }
    const rawToken = generateToken(24);
    const invite = await Invite.create({
      organizationId: req.tenant.organizationId,
      email: email.toLowerCase(),
      role,
      tokenHash: hashToken(rawToken),
      invitedBy: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const json = invite.toJSON();
    return success(res, { ...json, token: rawToken }, null, 201);
  } catch (err) {
    if (err.code === 11000) {
      return fail(res, {
        status: 409,
        code: 'CONFLICT',
        message: 'Invite already pending for this email',
      });
    }
    next(err);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const { token } = req.body;
    const invite = await Invite.findOne({
      tokenHash: hashToken(token),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });
    if (!invite) {
      return fail(res, { status: 400, code: 'INVALID_TOKEN', message: 'Invalid or expired invite' });
    }

    const user = await User.findById(req.user.id);
    if (user.email.toLowerCase() !== invite.email) {
      return fail(res, {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Invite email does not match your account',
      });
    }

    const existingMember = await OrganizationMember.findOne({
      organizationId: invite.organizationId,
      userId: req.user.id,
    });
    if (!existingMember) {
      await OrganizationMember.create({
        organizationId: invite.organizationId,
        userId: req.user.id,
        role: invite.role,
      });
    }

    invite.status = 'accepted';
    await invite.save();
    await User.findByIdAndUpdate(req.user.id, {
      lastActiveOrganizationId: invite.organizationId,
    });

    const orgs = await getUserOrganizations(req.user.id);
    return success(res, { organizations: orgs });
  } catch (err) {
    next(err);
  }
}
