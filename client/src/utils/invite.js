import { ROUTES } from '../constants/index.js';

export function buildInviteAcceptUrl(token) {
  const path = `${ROUTES.INVITE_ACCEPT}?token=${encodeURIComponent(token)}`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return path;
}
