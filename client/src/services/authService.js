import { api, isMockMode, normalizeResponse } from './api.js';
import { mockApi } from './mock/mockApi.js';

export async function signup(payload) {
  if (isMockMode()) return mockApi.signup(payload);
  const res = await api.post('/auth/signup', payload);
  return normalizeResponse(res).data;
}

export async function login(payload) {
  if (isMockMode()) return mockApi.login(payload);
  const res = await api.post('/auth/login', payload);
  return normalizeResponse(res).data;
}

export async function logout() {
  if (isMockMode()) return mockApi.logout();
  const res = await api.post('/auth/logout');
  return normalizeResponse(res).data;
}

export async function fetchMe() {
  if (isMockMode()) return mockApi.me();
  const res = await api.get('/auth/me');
  return normalizeResponse(res).data;
}

export async function refreshToken() {
  const res = await api.post('/auth/refresh');
  return normalizeResponse(res).data;
}
