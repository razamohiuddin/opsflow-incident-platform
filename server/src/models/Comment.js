import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';

const commentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

commentSchema.index({ incidentId: 1, createdAt: 1 });

toJSONPlugin(commentSchema);

export const Comment = mongoose.model('Comment', commentSchema);
