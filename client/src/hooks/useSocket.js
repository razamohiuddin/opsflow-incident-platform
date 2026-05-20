import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { isMockMode } from '../services/api.js';
import { STORAGE_KEYS } from '../constants/index.js';
import { patchIncidentInList } from '../store/slices/incidentsSlice.js';
import { fetchComments } from '../store/slices/incidentsSlice.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const isMongoObjectId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

export function useSocket() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const token = useSelector((s) => s.auth.accessToken);
  const orgId = useSelector((s) => s.organization.active?.id);
  const selectedId = useSelector((s) => s.incidents.selected?.id);

  const onIncidentUpdated = useCallback(
    (payload) => {
      dispatch(patchIncidentInList(payload));
    },
    [dispatch]
  );

  const onCommentCreated = useCallback(
    (payload) => {
      if (payload.incidentId === selectedId) {
        dispatch(fetchComments(selectedId));
      }
    },
    [dispatch, selectedId]
  );

  useEffect(() => {
    if (isMockMode() || !token || !orgId || !isMongoObjectId(orgId)) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:org', orgId);
    });

    socket.on('incident:updated', onIncidentUpdated);
    socket.on('incident:assigned', onIncidentUpdated);
    socket.on('comment:created', onCommentCreated);

    return () => {
      socket.off('incident:updated', onIncidentUpdated);
      socket.off('incident:assigned', onIncidentUpdated);
      socket.off('comment:created', onCommentCreated);
      socket.disconnect();
    };
  }, [token, orgId, onIncidentUpdated, onCommentCreated]);

  useEffect(() => {
    if (!socketRef.current || !selectedId) return;
    socketRef.current.emit('join:incident', selectedId);
    return () => {
      socketRef.current?.emit('leave:incident', selectedId);
    };
  }, [selectedId]);

  return socketRef;
}
