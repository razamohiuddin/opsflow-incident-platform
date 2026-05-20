import { Server } from 'socket.io';
import { verifyAccessToken } from '../services/tokenService.js';
import { getMembership } from '../services/organizationService.js';
import { env } from '../config/env.js';
import { isValidObjectId } from '../shared/objectId.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrls,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:org', async (orgId) => {
      try {
        if (!isValidObjectId(orgId)) return;
        const membership = await getMembership(socket.userId, orgId);
        if (membership) {
          socket.join(`org:${orgId}`);
          socket.organizationId = orgId;
        }
      } catch (err) {
        console.error('socket join:org error', err.message);
      }
    });

    socket.on('join:incident', (incidentId) => {
      if (socket.organizationId) {
        socket.join(`incident:${incidentId}`);
      }
    });

    socket.on('leave:incident', (incidentId) => {
      socket.leave(`incident:${incidentId}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
