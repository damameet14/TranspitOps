import { createContext, useContext, useState, type ReactNode } from 'react';
import apiClient from '../shared/api_client';
import type { UserRole } from './role_access';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface DemoRegistrationRequest {
  fullName: string;
  email: string;
  role: UserRole;
  demoEmail: string;
  demoPassword: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  registerDemoProfile: (request: DemoRegistrationRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/user-authentication/login', { email, password });
    const data = response.data;
    const newUser: User = {
      id: data.user_id,
      email: email,
      full_name: data.full_name,
      role: data.role as UserRole,
    };
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(data.access_token);
    setUser(newUser);
  };

  const registerDemoProfile = async (request: DemoRegistrationRequest) => {
    const response = await apiClient.post('/user-authentication/login', {
      email: request.demoEmail,
      password: request.demoPassword,
    });
    const data = response.data;
    const registeredUser: User = { id: data.user_id, email: request.email, full_name: request.fullName, role: request.role };
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    localStorage.setItem('demo_registration', 'true');
    setToken(data.access_token);
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('demo_registration');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, registerDemoProfile, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
