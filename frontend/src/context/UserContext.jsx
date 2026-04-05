import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserContext = createContext(null);

const TOKEN_KEY = 'ef_user_token';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (token) {
      api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => setUser(data))
        .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const register = async (nombre, email, password) => {
    const { data } = await api.post('/users/register', { nombre, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (fields) => {
    const { data } = await api.put('/users/me', fields, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, token, loading, isLoggedIn: !!user, register, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
