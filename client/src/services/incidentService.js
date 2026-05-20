import { api, isMockMode, normalizeResponse } from './api.js';
import { mockApi } from './mock/mockApi.js';

export async function listIncidents(params) {
  if (isMockMode()) return mockApi.listIncidents(params);
  const res = await api.get('/incidents', { params });
  const { data, meta } = normalizeResponse(res);
  return { items: data, meta };
}

export async function getIncident(id) {
  if (isMockMode()) return mockApi.getIncident(id);
  const res = await api.get(`/incidents/${id}`);
  return normalizeResponse(res).data;
}

export async function createIncident(payload) {
  if (isMockMode()) return mockApi.createIncident(payload);
  const res = await api.post('/incidents', payload);
  return normalizeResponse(res).data;
}

export async function updateIncident(id, payload) {
  if (isMockMode()) return mockApi.updateIncident(id, payload);
  const res = await api.patch(`/incidents/${id}`, payload);
  return normalizeResponse(res).data;
}

export async function deleteIncident(id) {
  if (isMockMode()) return mockApi.deleteIncident(id);
  const res = await api.delete(`/incidents/${id}`);
  return normalizeResponse(res).data;
}

export async function listComments(incidentId) {
  if (isMockMode()) return mockApi.listComments(incidentId);
  const res = await api.get(`/incidents/${incidentId}/comments`);
  return normalizeResponse(res).data;
}

export async function addComment(incidentId, body) {
  if (isMockMode()) return mockApi.addComment(incidentId, body);
  const res = await api.post(`/incidents/${incidentId}/comments`, { body });
  return normalizeResponse(res).data;
}

export async function uploadAttachment(incidentId, file) {
  if (isMockMode()) {
    return {
      id: `att-${Date.now()}`,
      filename: file.name,
      size: file.size,
    };
  }
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/incidents/${incidentId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeResponse(res).data;
}
