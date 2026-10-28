// Backend locations. In development Vite proxies /api and /socket.io to localhost:5000.
export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;
