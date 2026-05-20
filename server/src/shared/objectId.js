import mongoose from 'mongoose';

/** Rejects mock ids like "org-1" that pass loose isValid checks */
export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  return String(new mongoose.Types.ObjectId(id)) === id;
}
