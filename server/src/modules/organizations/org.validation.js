import Joi from 'joi';
import { ROLES } from '../../shared/constants.js';

export const createOrgSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
});

export const inviteSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string()
    .valid(...ROLES)
    .default('developer'),
});

export const acceptInviteSchema = Joi.object({
  token: Joi.string().required(),
});
