import { Incident } from '../../models/Incident.js';
import { Attachment } from '../../models/Attachment.js';
import { success, fail } from '../../shared/response.js';

export async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, { status: 400, code: 'VALIDATION_ERROR', message: 'File is required' });
    }

    const incident = await Incident.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
    });
    if (!incident) {
      return fail(res, { status: 404, code: 'NOT_FOUND', message: 'Incident not found' });
    }

    const attachment = await Attachment.create({
      organizationId: req.tenant.organizationId,
      incidentId: incident._id,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storagePath: req.file.path,
      uploadedBy: req.user.id,
    });

    return success(res, attachment.toJSON(), null, 201);
  } catch (err) {
    next(err);
  }
}
