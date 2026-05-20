import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.js';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

toJSONPlugin(organizationSchema);

export const Organization = mongoose.model('Organization', organizationSchema);
