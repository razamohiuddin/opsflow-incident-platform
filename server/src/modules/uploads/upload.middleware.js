import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot =
  env.uploadDir || path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const orgId = req.tenant.organizationId;
    const incidentId = req.params.id;
    const dir = path.join(uploadRoot, orgId, incidentId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/json',
];

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: env.uploadMaxMb * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});
