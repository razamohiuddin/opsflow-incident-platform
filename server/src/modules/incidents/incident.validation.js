import Joi from 'joi';
import { INCIDENT_STATUS, SEVERITY } from '../../shared/constants.js';

export const createIncidentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(10000).allow('').default(''),
  severity: Joi.string()
    .valid(...SEVERITY)
    .required(),
  status: Joi.string()
    .valid(...INCIDENT_STATUS)
    .default('open'),
  tags: Joi.array().items(Joi.string().max(50)).max(20).default([]),
  assigneeId: Joi.string().allow(null, '').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
});

export const updateIncidentSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(10000).allow(''),
  severity: Joi.string().valid(...SEVERITY),
  status: Joi.string().valid(...INCIDENT_STATUS),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
  assigneeId: Joi.string().allow(null, ''),
  dueDate: Joi.date().iso().allow(null),
  version: Joi.number().integer().min(1).required(),
});

export const listIncidentsSchema = Joi.object({
  status: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  severity: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  assigneeId: Joi.string().allow('unassigned', ''),
  reporterId: Joi.string(),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  q: Joi.string().max(200).allow(''),
  sort: Joi.string().valid('createdAt', 'dueDate', 'severity', 'status', 'updatedAt').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const commentSchema = Joi.object({
  body: Joi.string().min(1).max(5000).required(),
});
