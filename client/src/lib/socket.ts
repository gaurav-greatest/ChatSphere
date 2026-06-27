import { io, Socket } from 'socket.io-client';
import { store } from '../app/store.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Creates and returns a Socket.IO connection.
 * Authenticates via JWT passed in the handshake auth object.
 */
export const connectSocket = (): Socket => {
  if (socket?.connected) return socket;

  const state = store.getState();
  const token = state.auth.accessToken;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.info('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.info('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
};

/**
 * Returns the current socket instance (may be null if not connected).
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnects the socket.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
