import crypto from 'crypto';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function parseMentions(body, members) {
  const regex = /@([^\s@]+@[^\s@]+\.[^\s@]+)/g;
  const mentions = [];
  let match;
  while ((match = regex.exec(body)) !== null) {
    const email = match[1].toLowerCase();
    const user = members.find((m) => m.email?.toLowerCase() === email);
    if (user) mentions.push(user._id || user.id);
  }
  return mentions;
}

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
