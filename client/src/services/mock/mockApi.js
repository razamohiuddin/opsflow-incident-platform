import { mockStore } from './mockStore.js';

function filterIncidents(list, params, orgId) {
  let result = list.filter((i) => i.organizationId === orgId);

  if (params.status?.length) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    result = result.filter((i) => statuses.includes(i.status));
  }
  if (params.severity?.length) {
    const severities = Array.isArray(params.severity) ? params.severity : [params.severity];
    result = result.filter((i) => severities.includes(i.severity));
  }
  if (params.assigneeId === 'unassigned') {
    result = result.filter((i) => !i.assigneeId);
  } else if (params.assigneeId) {
    result = result.filter((i) => i.assigneeId === params.assigneeId);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter((i) => i.title.toLowerCase().includes(q));
  }
  if (params.from) {
    result = result.filter((i) => new Date(i.createdAt) >= new Date(params.from));
  }
  if (params.to) {
    result = result.filter((i) => new Date(i.createdAt) <= new Date(params.to));
  }

  const sortField = params.sort || 'createdAt';
  const order = params.order === 'asc' ? 1 : -1;
  result.sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    if (av < bv) return -1 * order;
    if (av > bv) return 1 * order;
    return 0;
  });

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const total = result.length;
  const start = (page - 1) * limit;
  const items = result.slice(start, start + limit);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

function parseMentions(body, members) {
  const regex = /@([^\s@]+@[^\s@]+\.[^\s@]+)/g;
  const mentions = [];
  let match;
  while ((match = regex.exec(body)) !== null) {
    const email = match[1];
    const user = members.find((m) => m.email === email);
    if (user) mentions.push(user.id);
  }
  return mentions;
}

export const mockApi = {
  async signup({ name, email, password }) {
    await mockStore.delay();
    if (mockStore.getUsers().some((u) => u.email === email)) {
      throw { response: { data: { error: { message: 'Email already registered' } } } };
    }
    const id = `user-${Date.now()}`;
    const user = { id, name, email, password };
    mockStore.setUsers([...mockStore.getUsers(), user]);
    mockStore.setUserOrganizations(id, []);
    mockStore.setCurrentUserId(id);
    const { password: _, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken: `mock-access-${id}`,
      refreshToken: `mock-refresh-${id}`,
      organizations: [],
    };
  },

  async login({ email, password }) {
    await mockStore.delay();
    const user = mockStore.getUsers().find((u) => u.email === email && u.password === password);
    if (!user) throw { response: { data: { error: { message: 'Invalid email or password' } } } };
    mockStore.setCurrentUserId(user.id);
    const { password: _, ...safeUser } = user;
    const userOrgs = mockStore.getUserOrganizations(user.id);
    const organizations =
      userOrgs !== undefined ? userOrgs : mockStore.getOrgs();
    return {
      user: safeUser,
      accessToken: `mock-access-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
      organizations,
    };
  },

  async me() {
    await mockStore.delay(200);
    const userId = mockStore.getCurrentUserId();
    if (!userId) throw { response: { status: 401 } };
    const user = mockStore.getUsers().find((u) => u.id === userId);
    const { password: _, ...safeUser } = user;
    const userOrgs = mockStore.getUserOrganizations(userId);
    const organizations = userOrgs !== undefined ? userOrgs : mockStore.getOrgs();
    return { user: safeUser, organizations };
  },

  async logout() {
    await mockStore.delay(200);
    mockStore.setCurrentUserId(null);
    return {};
  },

  async listOrganizations() {
    await mockStore.delay(200);
    const userId = mockStore.getCurrentUserId();
    const userOrgs = userId ? mockStore.getUserOrganizations(userId) : null;
    if (userOrgs?.length) return userOrgs;
    return mockStore.getOrgs();
  },

  async createOrganization({ name }) {
    await mockStore.delay();
    const id = `org-${Date.now()}`;
    const org = { id, name, slug: name.toLowerCase().replace(/\s+/g, '-'), role: 'admin' };
    mockStore.setOrgs([...mockStore.getOrgs(), org]);
    return org;
  },

  async switchOrganization(orgId) {
    await mockStore.delay(200);
    const org = mockStore.getOrgs().find((o) => o.id === orgId);
    if (!org) throw { response: { data: { error: { message: 'Organization not found' } } } };
    mockStore.setActiveOrgId(orgId);
    return { organization: org, accessToken: `mock-access-org-${orgId}` };
  },

  async getDashboard() {
    await mockStore.delay();
    return mockStore.getDashboard();
  },

  async listIncidents(params = {}) {
    await mockStore.delay();
    return filterIncidents(mockStore.getIncidents(), params, mockStore.getActiveOrgId());
  },

  async getIncident(id) {
    await mockStore.delay();
    const incident = mockStore.getIncidents().find((i) => i.id === id);
    if (!incident) throw { response: { data: { error: { message: 'Incident not found' } } } };
    const activityLogs = mockStore.getActivity()[id] || [];
    return { incident, activity: activityLogs };
  },

  async createIncident(payload) {
    await mockStore.delay();
    const orgId = mockStore.getActiveOrgId();
    const userId = mockStore.getCurrentUserId();
    const user = mockStore.getUsers().find((u) => u.id === userId);
    const members = mockStore.getMembers();
    const assignee = members.find((m) => m.id === payload.assigneeId);

    const incident = {
      id: `inc-${Date.now()}`,
      organizationId: orgId,
      ...payload,
      tags: payload.tags || [],
      assigneeSnapshot: assignee
        ? { id: assignee.id, name: assignee.name, email: assignee.email }
        : null,
      reporterId: userId,
      reporterSnapshot: { id: userId, name: user.name, email: user.email },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    };
    mockStore.setIncidents([incident, ...mockStore.getIncidents()]);
    return incident;
  },

  async updateIncident(id, payload) {
    await mockStore.delay();
    const list = mockStore.getIncidents();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) throw { response: { data: { error: { message: 'Incident not found' } } } };

    const current = list[idx];
    if (payload.version !== undefined && payload.version !== current.version) {
      throw {
        response: {
          status: 409,
          data: { error: { code: 'CONFLICT', message: 'Incident was updated by someone else' } },
        },
      };
    }

    const members = mockStore.getMembers();
    let assigneeSnapshot = current.assigneeSnapshot;
    if (payload.assigneeId !== undefined) {
      const assignee = members.find((m) => m.id === payload.assigneeId);
      assigneeSnapshot = assignee
        ? { id: assignee.id, name: assignee.name, email: assignee.email }
        : null;
    }

    const updated = {
      ...current,
      ...payload,
      assigneeSnapshot,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      resolvedAt:
        ['resolved', 'closed'].includes(payload.status) && !current.resolvedAt
          ? new Date().toISOString()
          : current.resolvedAt,
    };
    const next = [...list];
    next[idx] = updated;
    mockStore.setIncidents(next);
    return updated;
  },

  async deleteIncident(id) {
    await mockStore.delay();
    mockStore.setIncidents(mockStore.getIncidents().filter((i) => i.id !== id));
    return {};
  },

  async listComments(incidentId) {
    await mockStore.delay(200);
    return mockStore.getComments()[incidentId] || [];
  },

  async addComment(incidentId, body) {
    await mockStore.delay();
    const userId = mockStore.getCurrentUserId();
    const user = mockStore.getUsers().find((u) => u.id === userId);
    const members = mockStore.getMembers();
    const comment = {
      id: `cmt-${Date.now()}`,
      incidentId,
      authorId: userId,
      authorName: user.name,
      body,
      mentions: parseMentions(body, members),
      createdAt: new Date().toISOString(),
    };
    const all = mockStore.getComments();
    all[incidentId] = [...(all[incidentId] || []), comment];
    mockStore.setComments(all);
    return comment;
  },

  async listMembers() {
    await mockStore.delay(200);
    return mockStore.getMembers().filter((m) => !m.deleted);
  },

  async listInvites() {
    await mockStore.delay(200);
    return mockStore.getInvites();
  },

  async createInvite({ email, role }) {
    await mockStore.delay();
    if (mockStore.getInvites().some((i) => i.email === email && i.status === 'pending')) {
      throw {
        response: {
          status: 409,
          data: { error: { message: 'Invite already pending for this email' } },
        },
      };
    }
    const orgId = mockStore.getActiveOrgId();
    const org = mockStore.getOrgs().find((o) => o.id === orgId);
    const token = `mock-invite-${Date.now()}`;
    const invite = {
      id: `inv-${Date.now()}`,
      organizationId: orgId,
      organizationName: org?.name,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      token,
      createdAt: new Date().toISOString(),
    };
    mockStore.setInvites([...mockStore.getInvites(), invite]);
    return invite;
  },

  async acceptInvite({ token }) {
    await mockStore.delay();
    const userId = mockStore.getCurrentUserId();
    if (!userId) throw { response: { status: 401 } };
    const user = mockStore.getUsers().find((u) => u.id === userId);
    const invite = mockStore.getInvites().find((i) => i.token === token && i.status === 'pending');
    if (!invite) {
      throw {
        response: {
          data: { error: { message: 'Invalid or expired invite' } },
        },
      };
    }
    if (user.email.toLowerCase() !== invite.email) {
      throw {
        response: {
          status: 403,
          data: { error: { message: 'Invite email does not match your account' } },
        },
      };
    }
    const org = mockStore.getOrgs().find((o) => o.id === invite.organizationId);
    if (!org) {
      throw {
        response: {
          data: { error: { message: 'Organization not found' } },
        },
      };
    }
    const membership = { ...org, role: invite.role };
    const existing = mockStore.getUserOrganizations(userId) || [];
    const orgs = existing.some((o) => o.id === org.id)
      ? existing
      : [...existing, membership];
    mockStore.setUserOrganizations(userId, orgs);
    mockStore.setInvites(
      mockStore.getInvites().map((i) => (i.id === invite.id ? { ...i, status: 'accepted' } : i))
    );
    mockStore.setActiveOrgId(org.id);
    return { organizations: orgs };
  },
};
