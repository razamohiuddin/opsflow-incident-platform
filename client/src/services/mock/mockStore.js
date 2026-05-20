import {
  MOCK_USERS,
  MOCK_ORGS,
  MOCK_INCIDENTS,
  MOCK_COMMENTS,
  MOCK_ACTIVITY,
  MOCK_DASHBOARD,
  MOCK_INVITES,
  MOCK_MEMBERS,
} from './mockData.js';

let users = [...MOCK_USERS];
let orgs = [...MOCK_ORGS];
let incidents = [...MOCK_INCIDENTS];
let comments = structuredClone(MOCK_COMMENTS);
let activity = structuredClone(MOCK_ACTIVITY);
let invites = [...MOCK_INVITES];
let currentUserId = null;
let activeOrgId = 'org-1';
/** @type {Record<string, typeof MOCK_ORGS>} */
let userOrganizations = {};

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const mockStore = {
  delay,
  getUsers: () => users,
  getOrgs: () => orgs,
  getIncidents: () => incidents,
  getComments: () => comments,
  getActivity: () => activity,
  getInvites: () => invites,
  getMembers: () => MOCK_MEMBERS,
  getDashboard: () => MOCK_DASHBOARD,
  getCurrentUserId: () => currentUserId,
  getActiveOrgId: () => activeOrgId,
  setCurrentUserId: (id) => {
    currentUserId = id;
  },
  setActiveOrgId: (id) => {
    activeOrgId = id;
  },
  setUsers: (u) => {
    users = u;
  },
  setOrgs: (o) => {
    orgs = o;
  },
  setIncidents: (i) => {
    incidents = i;
  },
  setComments: (c) => {
    comments = c;
  },
  setActivity: (a) => {
    activity = a;
  },
  setInvites: (inv) => {
    invites = inv;
  },
  getUserOrganizations: (userId) => userOrganizations[userId],
  setUserOrganizations: (userId, orgs) => {
    userOrganizations[userId] = orgs;
  },
};
