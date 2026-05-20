import { api, isMockMode, normalizeResponse } from './api.js';
import { mockApi } from './mock/mockApi.js';

export async function getDashboardMetrics() {
  if (isMockMode()) return mockApi.getDashboard();
  const res = await api.get('/dashboard/metrics');
  return normalizeResponse(res).data;
}
