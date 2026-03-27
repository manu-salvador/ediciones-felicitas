import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Recuperar sesión al cargar
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedAdminToken = localStorage.getItem('adminToken');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  };

  const adminLogin = async (email: string, password: string) => {
    const { data } = await api.post('/api/admin/auth/login', { email, password });
    localStorage.setItem('adminToken', data.data.token);
    setAdminToken(data.data.token);
  };

  const updateUser = async (data: Partial<User>) => {
    const res = await api.put('/api/auth/me', data);
    const updatedUser = res.data.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    setUser(null);
    setAdminToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, adminToken, login, adminLogin, logout, updateUser, isLoading, isAdmin: !!adminToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
