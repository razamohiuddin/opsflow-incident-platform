import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';

const attachmentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

toJSONPlugin(attachmentSchema);

export const Attachment = mongoose.model('Attachment', attachmentSchema);
