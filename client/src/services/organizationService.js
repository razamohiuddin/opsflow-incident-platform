import { api, isMockMode, normalizeResponse } from './api.js';
import { mockApi } from './mock/mockApi.js';

export async function listOrganizations() {
  if (isMockMode()) return mockApi.listOrganizations();
  const res = await api.get('/organizations');
  return normalizeResponse(res).data;
}

export async function createOrganization(payload) {
  if (isMockMode()) return mockApi.createOrganization(payload);
  const res = await api.post('/organizations', payload);
  return normalizeResponse(res).data;
}

export async function switchOrganization(orgId) {
  if (isMockMode()) return mockApi.switchOrganization(orgId);
  const res = await api.post(`/organizations/${orgId}/switch`);
  return normalizeResponse(res).data;
}

export async function listMembers() {
  if (isMockMode()) return mockApi.listMembers();
  const res = await api.get('/organizations/members');
  return normalizeResponse(res).data;
}

export async function listInvites() {
  if (isMockMode()) return mockApi.listInvites();
  const res = await api.get('/organizations/invites');
  return normalizeResponse(res).data;
}

export async function createInvite(payload) {
  if (isMockMode()) return mockApi.createInvite(payload);
  const res = await api.post('/organizations/invites', payload);
  return normalizeResponse(res).data;
}

export async function acceptInvite({ token }) {
  if (isMockMode()) return mockApi.acceptInvite({ token });
  const res = await api.post('/organizations/invites/accept', { token });
  return normalizeResponse(res).data;
}
