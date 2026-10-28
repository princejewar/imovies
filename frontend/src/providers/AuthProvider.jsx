import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext.jsx';
import api, { TOKEN_KEY } from '../utils/api.js';

function readSession() {
  const token = Cookies.get(TOKEN_KEY);
  if (!token) return null;
  try {
    const d = jwtDecode(token);
    if (d.exp * 1000 < Date.now()) { Cookies.remove(TOKEN_KEY); return null; }
    return { id: d.id, role: d.role, username: d.name };
  } catch {
    Cookies.remove(TOKEN_KEY);
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [favorites, setFavorites] = useState([]); // movie ids
  const [unread, setUnread] = useState(0);

  const authenticate = (data) => {
    Cookies.set(TOKEN_KEY, data.token, { expires: 7, sameSite: 'strict' });
    setUser(readSession());
    return data.user;
  };

  const login = async (email, password, role = 'user') =>
    authenticate((await api.post(role === 'admin' ? '/auth/admin/login' : '/auth/login', { email, password })).data);

  const register = async (form, role = 'user') =>
    authenticate((await api.post(role === 'admin' ? '/auth/admin/register' : '/auth/register', form)).data);

  const logout = () => { Cookies.remove(TOKEN_KEY); setUser(null); };

  // Customers: load favorites and poll for new alerts.
  useEffect(() => {
    if (user?.role !== 'user') { setFavorites([]); setUnread(0); return; }
    api.get('/favorites').then((r) => setFavorites(r.data.map((m) => m._id))).catch(() => {});
    const poll = () => api.get('/notifications').then((r) => setUnread(r.data.unread)).catch(() => {});
    poll();
    const t = setInterval(poll, 15000);
    return () => clearInterval(t);
  }, [user]);

  const toggleFavorite = useCallback(async (movieId) => {
    if (favorites.includes(movieId)) {
      await api.delete(`/favorites/${movieId}`);
      setFavorites((f) => f.filter((x) => x !== movieId));
    } else {
      await api.post(`/favorites/${movieId}`);
      setFavorites((f) => [...f, movieId]);
    }
  }, [favorites]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, favorites, toggleFavorite, unread, setUnread }}>
      {children}
    </AuthContext.Provider>
  );
}
