import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';
import { INCIDENT_STATUS, SEVERITY } from '../shared/constants.js';

const snapshotSchema = new mongoose.Schema(
  { id: String, name: String, email: String },
  { _id: false }
);

const incidentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    severity: { type: String, enum: SEVERITY, required: true },
    status: { type: String, enum: INCIDENT_STATUS, default: 'open' },
    tags: [{ type: String, trim: true }],
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assigneeSnapshot: { type: snapshotSchema, default: null },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reporterSnapshot: { type: snapshotSchema, required: true },
    dueDate: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

incidentSchema.index({ organizationId: 1, status: 1, severity: 1, createdAt: -1 });
incidentSchema.index({ organizationId: 1, title: 'text' });

toJSONPlugin(incidentSchema);

export const Incident = mongoose.model('Incident', incidentSchema);
