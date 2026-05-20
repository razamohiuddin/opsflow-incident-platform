export const MOCK_USERS = [
  {
    id: 'user-1',
    name: 'Alex Chen',
    email: 'alex@acme.io',
    password: 'password123',
  },
  {
    id: 'user-2',
    name: 'Jordan Lee',
    email: 'jordan@acme.io',
    password: 'password123',
  },
  {
    id: 'user-3',
    name: 'Sam Rivera',
    email: 'sam@acme.io',
    password: 'password123',
  },
];

export const MOCK_ORGS = [
  {
    id: 'org-1',
    name: 'Acme Engineering',
    slug: 'acme',
    role: 'admin',
  },
  {
    id: 'org-2',
    name: 'Beta Ops',
    slug: 'beta',
    role: 'manager',
  },
];

export const MOCK_MEMBERS = [
  { id: 'user-1', name: 'Alex Chen', email: 'alex@acme.io', role: 'admin' },
  { id: 'user-2', name: 'Jordan Lee', email: 'jordan@acme.io', role: 'manager' },
  { id: 'user-3', name: 'Sam Rivera', email: 'sam@acme.io', role: 'developer' },
  { id: 'user-4', name: 'Former User', email: 'former@acme.io', role: 'developer', deleted: true },
];

const now = Date.now();
const day = 86400000;

export const MOCK_INCIDENTS = [
  {
    id: 'inc-1',
    organizationId: 'org-1',
    title: 'API latency spike in production',
    description: 'P99 latency exceeded 2s on checkout service after deploy v2.4.1.',
    severity: 'critical',
    status: 'in_progress',
    tags: ['api', 'production', 'latency'],
    assigneeId: 'user-2',
    assigneeSnapshot: { id: 'user-2', name: 'Jordan Lee', email: 'jordan@acme.io' },
    reporterId: 'user-1',
    reporterSnapshot: { id: 'user-1', name: 'Alex Chen', email: 'alex@acme.io' },
    dueDate: new Date(now + day * 2).toISOString(),
    version: 3,
    createdAt: new Date(now - day * 3).toISOString(),
    updatedAt: new Date(now - day).toISOString(),
    resolvedAt: null,
  },
  {
    id: 'inc-2',
    organizationId: 'org-1',
    title: 'Database connection pool exhaustion',
    description: 'MongoDB connections maxed out during peak traffic.',
    severity: 'high',
    status: 'open',
    tags: ['database', 'mongodb'],
    assigneeId: 'user-3',
    assigneeSnapshot: { id: 'user-3', name: 'Sam Rivera', email: 'sam@acme.io' },
    reporterId: 'user-2',
    reporterSnapshot: { id: 'user-2', name: 'Jordan Lee', email: 'jordan@acme.io' },
    dueDate: new Date(now + day * 5).toISOString(),
    version: 1,
    createdAt: new Date(now - day * 2).toISOString(),
    updatedAt: new Date(now - day * 2).toISOString(),
    resolvedAt: null,
  },
  {
    id: 'inc-3',
    organizationId: 'org-1',
    title: 'SSL certificate renewal reminder',
    description: 'Wildcard cert expires in 14 days.',
    severity: 'low',
    status: 'closed',
    tags: ['security', 'infra'],
    assigneeId: 'user-4',
    assigneeSnapshot: { id: 'user-4', name: 'Former User', email: 'former@acme.io' },
    reporterId: 'user-1',
    reporterSnapshot: { id: 'user-1', name: 'Alex Chen', email: 'alex@acme.io' },
    dueDate: new Date(now - day * 10).toISOString(),
    version: 5,
    createdAt: new Date(now - day * 20).toISOString(),
    updatedAt: new Date(now - day * 5).toISOString(),
    resolvedAt: new Date(now - day * 5).toISOString(),
  },
  {
    id: 'inc-4',
    organizationId: 'org-1',
    title: 'Webhook delivery failures',
    description: 'Partner webhooks failing with 503 intermittently.',
    severity: 'medium',
    status: 'resolved',
    tags: ['webhooks', 'integrations'],
    assigneeId: null,
    assigneeSnapshot: null,
    reporterId: 'user-3',
    reporterSnapshot: { id: 'user-3', name: 'Sam Rivera', email: 'sam@acme.io' },
    dueDate: null,
    version: 2,
    createdAt: new Date(now - day * 7).toISOString(),
    updatedAt: new Date(now - day).toISOString(),
    resolvedAt: new Date(now - day).toISOString(),
  },
];

export const MOCK_COMMENTS = {
  'inc-1': [
    {
      id: 'cmt-1',
      incidentId: 'inc-1',
      authorId: 'user-2',
      authorName: 'Jordan Lee',
      body: 'Investigating deploy rollback. @jordan@acme.io on call.',
      mentions: ['user-2'],
      createdAt: new Date(now - day * 2).toISOString(),
    },
    {
      id: 'cmt-2',
      incidentId: 'inc-1',
      authorId: 'user-1',
      authorName: 'Alex Chen',
      body: 'Please update when rollback completes.',
      mentions: [],
      createdAt: new Date(now - day).toISOString(),
    },
  ],
  'inc-2': [],
  'inc-3': [],
  'inc-4': [],
};

export const MOCK_ACTIVITY = {
  'inc-1': [
    {
      id: 'act-1',
      action: 'incident.created',
      message: 'Alex Chen created this incident',
      actorName: 'Alex Chen',
      createdAt: new Date(now - day * 3).toISOString(),
      metadata: {},
    },
    {
      id: 'act-2',
      action: 'severity_changed',
      message: 'Jordan Lee changed severity from high to critical',
      actorName: 'Jordan Lee',
      createdAt: new Date(now - day * 2.5).toISOString(),
      metadata: { from: 'high', to: 'critical' },
    },
    {
      id: 'act-3',
      action: 'assignee_changed',
      message: 'Alex Chen assigned Jordan Lee',
      actorName: 'Alex Chen',
      createdAt: new Date(now - day * 2).toISOString(),
      metadata: {},
    },
    {
      id: 'act-4',
      action: 'status_changed',
      message: 'Jordan Lee changed status from open to in progress',
      actorName: 'Jordan Lee',
      createdAt: new Date(now - day).toISOString(),
      metadata: { from: 'open', to: 'in_progress' },
    },
  ],
};

export const MOCK_DASHBOARD = {
  openCount: 2,
  closedCount: 1,
  bySeverity: [
    { severity: 'critical', count: 1 },
    { severity: 'high', count: 1 },
    { severity: 'medium', count: 1 },
    { severity: 'low', count: 1 },
  ],
  avgResolutionMs: 432000000,
  activeUsers: [
    { userId: 'user-2', name: 'Jordan Lee', count: 12 },
    { userId: 'user-1', name: 'Alex Chen', count: 9 },
    { userId: 'user-3', name: 'Sam Rivera', count: 5 },
  ],
};

export const MOCK_INVITES = [
  {
    id: 'inv-pending-1',
    email: 'newhire@acme.io',
    role: 'developer',
    status: 'pending',
    createdAt: new Date(now - day).toISOString(),
  },
];
