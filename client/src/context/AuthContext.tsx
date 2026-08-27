import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser, IFarmerProfile, IProcurementCentre } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  profile: IFarmerProfile | null;
  centre: IProcurementCentre | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<IUser | undefined>;
  register: (data: any) => Promise<IUser | undefined>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [profile, setProfile] = useState<IFarmerProfile | null>(null);
  const [centre, setCentre] = useState<IProcurementCentre | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('procurex_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('procurex_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        setCentre(res.data.centre || null);
      }
    } catch (error) {
      console.error('Session expired or invalid:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, pass: string): Promise<IUser | undefined> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(identifier, pass);
      if (res.data.success) {
        localStorage.setItem('procurex_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        setCentre(res.data.centre || null);
        return res.data.user;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<IUser | undefined> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.data.success) {
        localStorage.setItem('procurex_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        return res.data.user;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('procurex_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setCentre(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        centre,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
